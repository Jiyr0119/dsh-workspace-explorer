// dsh-workspace-explorer — Host 半区 v2(顶部 Tab + 可配置)
//
// 新增 ws-tree.config RPC:客户端设置页可实时调整 噪声目录 / 最大条目 / 预览行数。
// 注意:动态插件要求纯 JavaScript,禁止 import / TypeScript / JSX。
return {
  apply(ctx) {
    const fs = ctx.get('fs')
    if (fs === undefined) return

    // 噪声目录(不展示,避免海量 node_modules 之类的内容)
    const DEFAULT_IGNORED = ['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.pytest_cache', '.ruff_cache', '.mypy_cache', 'dist', 'build', '.next', '.nuxt', 'coverage', '.idea', 'target']
    // 运行期配置:客户端 ws-tree.config 可修改
    const cfg = {
      ignore: DEFAULT_IGNORED.slice(),
      max: 400,
      peekMaxBytes: 200 * 1024,
      peekMaxLines: 60,
    }

    const joinRel = (root, rel) => {
      const base = String(root).replace(/\/+$/, '')
      return rel.split('/').reduce((acc, seg) => acc + '/' + seg, base)
    }

    // 每个条目都返回 rel(相对当前根目录的路径),Client 用它做展开键与引用标记
    const listDir = async (absPath, baseRel) => {
      const target = await fs.resolve(absPath)
      const entries = await fs.listDir(target)
      const out = []
      for (const e of entries) {
        if (e.name === '.DS_Store') continue
        if (e.type === 'directory' && cfg.ignore.indexOf(e.name) >= 0) continue
        out.push({
          name: e.name,
          type: e.type === 'directory' ? 'directory' : 'file',
          path: fs.processPath(e.target),
          rel: baseRel === '' ? e.name : baseRel + '/' + e.name,
          size: typeof e.size === 'number' ? e.size : null,
        })
      }
      out.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      const truncated = out.length > cfg.max
      return { entries: truncated ? out.slice(0, cfg.max) : out, truncated }
    }

    // 动态备用路径无 offset 读取能力(fs.readBytes 只读文件头),用整读分页;
    // >8MB 的文件走 tooLarge 优雅降级(原生包无此限制,可块扫描分页)。
    const PAGE_READ_MAX = 8 * 1024 * 1024
    const readLinesPage = async (absPath, offset, limit) => {
      const target = await fs.resolve(absPath)
      const info = await fs.stat(target)
      const size = info && typeof info.size === 'number' ? info.size : 0
      if (size > PAGE_READ_MAX) return { tooLarge: true, size }
      const text = await fs.readText(target)
      const lines = text.split('\n')
      if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
      const page = lines.slice(offset, offset + limit)
      return { tooLarge: false, size, content: page.join('\n'), startLine: offset, lineCount: lines.length, hasMore: offset + page.length < lines.length }
    }

    // 递归收集目录树节点(树根相对 rel 从 '' 开始;受深度/条目预算限制)
    const buildTree = async (absPath, rel, depth, budget, out) => {
      if (depth < 0 || budget.remaining <= 0) return
      const { entries } = await listDir(absPath, rel)
      for (const e of entries) {
        if (budget.remaining <= 0) break
        out.push({ name: e.name, type: e.type, rel: e.rel })
        budget.remaining--
        if (e.type === 'directory') await buildTree(e.path, e.rel, depth - 1, budget, out)
      }
    }

    // 配置 RPC:客户端设置页实时生效
    harness.handle('ws-tree.config', async (args) => {
      const a = (args && typeof args === 'object') ? args : {}
      if (Array.isArray(a.ignore)) cfg.ignore = a.ignore.map((s) => String(s)).filter((s) => s !== '')
      if (typeof a.max === 'number' && a.max >= 1 && a.max <= 2000) cfg.max = Math.floor(a.max)
      if (typeof a.peekMaxLines === 'number' && a.peekMaxLines >= 10 && a.peekMaxLines <= 500) cfg.peekMaxLines = Math.floor(a.peekMaxLines)
      return { ok: true, ignore: cfg.ignore, max: cfg.max, peekMaxLines: cfg.peekMaxLines }
    })

    harness.handle('ws-tree.list', async (args) => {
      const a = (args && typeof args === 'object') ? args : {}
      const root = String(a.path || '')
      const rel = String(a.rel || '')
      if (root === '') return { ok: false, error: 'missing-path' }
      // 仅非空 rel 需要路径段校验:'' 是根目录列表,split 会产生空段
      if (rel !== '') {
        const segs = rel.split('/')
        if (segs.some((s) => s === '' || s === '.' || s === '..')) return { ok: false, error: 'bad-rel' }
      }
      const abs = rel === '' ? root : joinRel(root, rel)
      try {
        const { entries, truncated } = await listDir(abs, rel)
        return { ok: true, path: abs, rel, entries, truncated }
      } catch (err) {
        console.error('ws-tree.list failed', String(err && err.message ? err.message : err))
        return { ok: false, error: String(err && err.message ? err.message : err) }
      }
    })

    // 预览:按行分页读取文本文件(offset/limit);whole 模式(≤32KB)返回完整内容;二进制拒绝
    harness.handle('ws-tree.peek', async (args) => {
      const a = (args && typeof args === 'object') ? args : {}
      const path = String(a.path || '')
      if (path === '') return { ok: false, error: 'missing-path' }
      try {
        const target = await fs.resolve(path)
        const info = await fs.stat(target)
        const size = info && typeof info.size === 'number' ? info.size : 0
        // 二进制嗅探(前 8KB 找 NUL)
        let binary = false
        if (size > 0) {
          const probe = await fs.readBytes(target, undefined, Math.min(8192, size))
          binary = probe.indexOf(0) >= 0
        }
        if (binary) return { ok: true, binary: true, size, lineCount: null, startLine: 0, content: '', hasMore: false }
        if (a.whole === true && size <= 32 * 1024) {
          const text = await fs.readText(target)
          const lines = text.split('\n')
          if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
          return { ok: true, binary: false, size, lineCount: lines.length, startLine: 0, content: lines.join('\n'), hasMore: false }
        }
        const offset = Math.max(0, Math.floor(Number(a.offset) || 0))
        const limit = Math.min(2000, Math.max(1, Math.floor(Number(a.limit) || cfg.peekMaxLines)))
        const page = await readLinesPage(target, offset, limit)
        if (page.tooLarge) return { ok: true, tooLarge: true, binary: false, size: page.size, lineCount: null, startLine: 0, content: '', hasMore: false }
        return { ok: true, binary: false, size: page.size, content: page.content, startLine: page.startLine, lineCount: page.lineCount, hasMore: page.hasMore }
      } catch (err) {
        console.error('ws-tree.peek failed', String(err && err.message ? err.message : err))
        return { ok: false, error: String(err && err.message ? err.message : err) }
      }
    })

    // 目录树:递归节点(限深/限条目),供目录拖拽与多选批量插入
    harness.handle('ws-tree.tree', async (args) => {
      const a = (args && typeof args === 'object') ? args : {}
      const path = String(a.path || '')
      if (path === '') return { ok: false, error: 'missing-path' }
      const depth = Math.min(6, Math.max(1, Math.floor(Number(a.depth) || 3)))
      const maxEntries = Math.min(1000, Math.max(1, Math.floor(Number(a.maxEntries) || 200)))
      try {
        const target = await fs.resolve(path)
        const cleaned = String(path).replace(/\/+$/, '')
        const name = cleaned.split('/').pop() || String(path).split('/').pop()
        const entries = []
        const budget = { remaining: maxEntries }
        await buildTree(target, '', depth, budget, entries)
        return { ok: true, name, entries, entryCount: entries.length, truncated: budget.remaining <= 0 }
      } catch (err) {
        console.error('ws-tree.tree failed', String(err && err.message ? err.message : err))
        return { ok: false, error: String(err && err.message ? err.message : err) }
      }
    })
  },
}