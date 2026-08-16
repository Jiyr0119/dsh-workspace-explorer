// Host entry for composition mounting (`dsh plugin add` / cordis.yml rows).
//
// IMPORTANT — honest status: the fully interactive UI needs the dynamic-plugin
// bridge (`harness.handle` / `host.call`), which the runner only injects into
// DYNAMIC packages evaluated in its sandbox. A statically mounted package does
// not receive `harness`, and adding a public Remote namespace requires upstream
// DSH changes (see docs/native-package.md).
//
// This entry therefore mounts cleanly without crashing a composition while the
// working, interactive form stays the dynamic plugin (src/host.js + src/client.js,
// paste-installed per the README). The listing logic is kept here as a reusable
// helper so the native conversion has a head start.
import fs from 'node:fs/promises'
import { join } from 'node:path'

/** Noise directories hidden from the tree. */
export const IGNORED = new Set(['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.pytest_cache', '.ruff_cache', '.mypy_cache', 'dist', 'build', '.next', '.nuxt', 'coverage', '.idea', 'target'])

/**
 * List one directory level with files and sizes (the dynamic host half's logic,
 * ready for a future native Remote). @returns plain-JSON rows for the wire.
 */
export async function listWorkspaceDir(absPath) {
  const dirents = await fs.readdir(absPath, { withFileTypes: true })
  const rows = []
  for (const d of dirents) {
    if (d.name === '.DS_Store') continue
    if (d.isDirectory() && IGNORED.has(d.name)) continue
    const target = join(absPath, d.name)
    let size = null
    if (d.isFile()) {
      try { size = (await fs.stat(target)).size } catch { /* unreadable stat */ }
    }
    rows.push({ name: d.name, type: d.isDirectory() ? 'directory' : 'file', path: target, size })
  }
  rows.sort((a, b) => (a.type !== b.type ? (a.type === 'directory' ? -1 : 1) : a.name.localeCompare(b.name)))
  return rows
}

export default {
  apply(ctx) {
    // No-op host face today: keeps a static mount from crashing. The live UI
    // bridge is the dynamic plugin form (src/host.js). See docs/native-package.md.
    ctx.get('fs')
  },
}
