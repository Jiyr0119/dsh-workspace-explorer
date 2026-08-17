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

    // 预览:读取文本文件前 N 行(超过 200KB 或二进制则只返回标记)
    harness.handle('ws-tree.peek', async (args) => {
      const a = (args && typeof args === 'object') ? args : {}
      const path = String(a.path || '')
      if (path === '') return { ok: false, error: 'missing-path' }
      try {
        const target = await fs.resolve(path)
        const info = await fs.stat(target)
        const size = info && typeof info.size === 'number' ? info.size : 0
        if (size > cfg.peekMaxBytes) return { ok: true, tooLarge: true, binary: false, size, lineCount: 0, content: '', truncatedLines: false }
        const buf = await fs.readBytes(target, undefined, Math.max(size, 1))
        const text = new TextDecoder('utf-8').decode(buf)
        const binary = text.indexOf('\u0000') >= 0
        const lines = text.split('\n')
        const head = lines.slice(0, cfg.peekMaxLines).join('\n')
        return {
          ok: true, tooLarge: false, binary, size,
          content: head, truncatedLines: lines.length > cfg.peekMaxLines, lineCount: lines.length,
        }
      } catch (err) {
        console.error('ws-tree.peek failed', String(err && err.message ? err.message : err))
        return { ok: false, error: String(err && err.message ? err.message : err) }
      }
    })
  },
}