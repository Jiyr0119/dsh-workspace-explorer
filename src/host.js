// dsh-workspace-explorer — Host 半区（动态 Cordis 插件代码）
//
// 在 DeepSeek Harness 的动态插件“Host 代码”框中粘贴本文件内容即可。
// 职责：通过 `fs` 服务按目录懒加载工作区文件树，并暴露 `ws-tree.list` RPC 供 Client 调用。
// 注意：动态插件要求纯 JavaScript，禁止 import / TypeScript / JSX。
return {
  apply(ctx) {
    const fs = ctx.get('fs')
    if (fs === undefined) return

    // 噪声目录（不展示，避免海量 node_modules 之类的内容）
    const IGNORED = new Set(['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.pytest_cache', '.ruff_cache', '.mypy_cache', 'dist', 'build', '.next', '.nuxt', 'coverage', '.idea', 'target'])
    const MAX = 400

    const joinRel = (root, rel) => {
      const base = String(root).replace(/\/+$/, '')
      return rel.split('/').reduce((acc, seg) => acc + '/' + seg, base)
    }

    // 每个条目都返回 rel（相对当前根目录的路径），Client 用它做展开键与引用标记
    const listDir = async (absPath, baseRel) => {
      const target = await fs.resolve(absPath)
      const entries = await fs.listDir(target)
      const out = []
      for (const e of entries) {
        if (e.name === '.DS_Store') continue
        if (e.type === 'directory' && IGNORED.has(e.name)) continue
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
      const truncated = out.length > MAX
      return { entries: truncated ? out.slice(0, MAX) : out, truncated }
    }

    harness.handle('ws-tree.list', async (args) => {
      const a = (args && typeof args === 'object') ? args : {}
      const root = String(a.path || '')
      const rel = String(a.rel || '')
      if (root === '') return { ok: false, error: 'missing-path' }
      // 仅非空 rel 需要路径段校验：'' 是根目录列表，split 会产生空段
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
  },
}
