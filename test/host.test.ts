import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildTreeNodes, cfg, lineIndexCache, listDir, readLinesPage, resolveRel, sniffBinary } from '../src/index'

let dir: string

const originalMax = cfg.max
const originalIgnore = cfg.ignore.slice()

beforeEach(async () => {
  cfg.max = originalMax
  cfg.ignore = originalIgnore.slice()
  lineIndexCache.clear()
  dir = await mkdtemp(join(tmpdir(), 'dshwe-test-'))
})

afterEach(async () => {
  cfg.max = originalMax
  cfg.ignore = originalIgnore.slice()
  lineIndexCache.clear()
  await rm(dir, { recursive: true, force: true })
})

describe('resolveRel', () => {
  it('rejects a missing root', () => {
    expect(resolveRel('', 'a')).toEqual({ error: 'missing-root' })
  })

  it('rejects dangerous relative path segments', () => {
    expect(resolveRel('/ws', '../x')).toEqual({ error: 'bad-rel' })
    expect(resolveRel('/ws', 'a/../b')).toEqual({ error: 'bad-rel' })
    expect(resolveRel('/ws', 'a//b')).toEqual({ error: 'bad-rel' })
    expect(resolveRel('/ws', 'a/./b')).toEqual({ error: 'bad-rel' })
    expect(resolveRel('/ws', './a')).toEqual({ error: 'bad-rel' })
  })

  it('resolves a normal relative path inside the root', () => {
    expect(resolveRel('/ws', 'a/b.ts')).toEqual({ abs: '/ws/a/b.ts' })
  })

  it('normalizes a trailing slash on the root', () => {
    expect(resolveRel('/ws/', 'a')).toEqual({ abs: '/ws/a' })
  })

  it('returns the root unchanged for an empty rel', () => {
    expect(resolveRel('/ws', '')).toEqual({ abs: '/ws' })
  })
})

describe('listDir', () => {
  async function fixture() {
    await mkdir(join(dir, 'zdir'))
    await mkdir(join(dir, 'adir'))
    await mkdir(join(dir, 'node_modules'))
    await mkdir(join(dir, '.git'))
    await writeFile(join(dir, 'b.txt'), 'b')
    await writeFile(join(dir, 'a.txt'), 'a')
    await writeFile(join(dir, '.DS_Store'), 'x')
  }

  it('lists entries with directories first, then by name', async () => {
    await fixture()
    const { entries } = await listDir(dir, '')
    expect(entries.map((e) => e.name)).toEqual(['adir', 'zdir', 'a.txt', 'b.txt'])
  })

  it('skips .DS_Store and noise directories', async () => {
    await fixture()
    const { entries } = await listDir(dir, '')
    const names = entries.map((e) => e.name)
    expect(names).not.toContain('.DS_Store')
    expect(names).not.toContain('node_modules')
    expect(names).not.toContain('.git')
  })

  it('fills sizes for files and null for directories', async () => {
    await fixture()
    const { entries } = await listDir(dir, '')
    const byName = new Map(entries.map((e) => [e.name, e]))
    expect(byName.get('a.txt')?.size).toBe(1)
    expect(byName.get('adir')?.size).toBe(null)
    expect(byName.get('adir')?.type).toBe('directory')
  })

  it('computes nested rel paths from baseRel', async () => {
    await fixture()
    const { entries } = await listDir(dir, 'sub')
    const byName = new Map(entries.map((e) => [e.name, e]))
    expect(byName.get('a.txt')?.rel).toBe('sub/a.txt')
  })

  it('truncates at cfg.max and reports it', async () => {
    await fixture()
    cfg.max = 3
    const { entries, truncated } = await listDir(dir, '')
    expect(truncated).toBe(true)
    expect(entries.length).toBe(3)
    cfg.max = originalMax
    const full = await listDir(dir, '')
    expect(full.truncated).toBe(false)
    expect(full.entries.length).toBe(4)
  })
})

describe('readLinesPage (small file)', () => {
  let file: string
  beforeEach(async () => {
    file = join(dir, 'small.txt')
    await writeFile(file, ['l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7'].join('\n'))
  })

  it('returns the first page', async () => {
    const page = await readLinesPage(file, 0, 3)
    expect(page.content).toBe('l0\nl1\nl2')
    expect(page.startLine).toBe(0)
    expect(page.lineCount).toBe(8)
    expect(page.hasMore).toBe(true)
  })

  it('returns an interior page', async () => {
    const page = await readLinesPage(file, 3, 2)
    expect(page.content).toBe('l3\nl4')
    expect(page.hasMore).toBe(true)
  })

  it('returns the final partial page', async () => {
    const page = await readLinesPage(file, 6, 10)
    expect(page.content).toBe('l6\nl7')
    expect(page.hasMore).toBe(false)
  })

  it('returns empty content past the end', async () => {
    const page = await readLinesPage(file, 100, 5)
    expect(page.content).toBe('')
    expect(page.hasMore).toBe(false)
  })

  it('drops a trailing empty line', async () => {
    const withTrail = join(dir, 'trail.txt')
    await writeFile(withTrail, 'a\nb\n')
    const page = await readLinesPage(withTrail, 0, 10)
    expect(page.lineCount).toBe(2)
    expect(page.content).toBe('a\nb')
  })
})

describe('readLinesPage / pageScanLarge (large file >4MB)', () => {
  const N = 100_000
  let file: string
  let lines: string[]
  let big: string

  beforeEach(async () => {
    file = join(dir, 'big.txt')
    lines = Array.from({ length: N }, (_, i) => `line-${String(i).padStart(6, '0')}-${'x'.repeat(40)}`)
    big = lines.join('\n')
    await writeFile(file, big)
  })

  it('takes the large-file scan path', async () => {
    const info = await import('node:fs/promises')
    expect((await info.stat(file)).size).toBeGreaterThan(4 * 1024 * 1024)
  })

  it('returns the first page with unknown line count', async () => {
    const page = await readLinesPage(file, 0, 3)
    expect(page.content).toBe(lines.slice(0, 3).join('\n'))
    expect(page.lineCount).toBe(null)
    expect(page.hasMore).toBe(true)
  })

  it('returns an interior page correctly', async () => {
    const page = await readLinesPage(file, 50_000, 5)
    expect(page.content).toBe(lines.slice(50_000, 50_005).join('\n'))
  })

  it('scans to EOF, computes lineCount and clears hasMore', async () => {
    const page = await readLinesPage(file, N - 3, 10)
    expect(page.content).toBe(lines.slice(N - 3).join('\n'))
    expect(page.lineCount).toBe(N)
    expect(page.hasMore).toBe(false)
  })

  it('reuses the incremental line index cache', async () => {
    await readLinesPage(file, 0, 3)
    const cached = lineIndexCache.get(file)!
    expect(cached.offsets.length).toBeGreaterThan(1)
    expect(cached.scannedBytes).toBeLessThan(big.length)
    const beforeBytes = cached.scannedBytes
    const beforeOffsets = cached.offsets.length
    await readLinesPage(file, 50_000, 5)
    const reused = lineIndexCache.get(file)!
    expect(reused).toBe(cached)
    expect(reused.scannedBytes).toBeGreaterThan(beforeBytes)
    expect(reused.offsets.length).toBeGreaterThan(beforeOffsets)
  })

  it('returns empty content for an offset beyond EOF', async () => {
    const page = await readLinesPage(file, N + 100, 5)
    expect(page.content).toBe('')
    expect(page.hasMore).toBe(false)
  })
})

describe('sniffBinary', () => {
  it('returns false for plain text', async () => {
    const file = join(dir, 'text.txt')
    await writeFile(file, 'hello world')
    expect(await sniffBinary(file, 11)).toBe(false)
  })

  it('returns false for an empty file', async () => {
    const file = join(dir, 'empty.bin')
    await writeFile(file, '')
    expect(await sniffBinary(file, 0)).toBe(false)
  })

  it('detects a NUL byte in the probe window', async () => {
    const file = join(dir, 'nul.bin')
    await writeFile(file, Buffer.concat([Buffer.from('abc'), Buffer.from([0]), Buffer.from('def')]))
    expect(await sniffBinary(file, 7)).toBe(true)
  })

  it('ignores NUL bytes beyond the first 8KB probe window', async () => {
    const file = join(dir, 'late-nul.bin')
    const head = Buffer.alloc(8192, 0x61)
    const tail = Buffer.from([0])
    await writeFile(file, Buffer.concat([head, tail]))
    expect(await sniffBinary(file, head.length + tail.length)).toBe(false)
  })
})

describe('buildTreeNodes', () => {
  beforeEach(async () => {
    await mkdir(join(dir, 'dir1'))
    await mkdir(join(dir, 'dir1/sub'))
    await mkdir(join(dir, 'dir2'))
    await writeFile(join(dir, 'a.txt'), 'a')
    await writeFile(join(dir, 'dir1/b.txt'), 'b')
    await writeFile(join(dir, 'dir1/sub/c.txt'), 'c')
    await writeFile(join(dir, 'dir2/d.txt'), 'd')
  })

  it('collects root entries and one level of children at depth 1', async () => {
    const out: Array<{ name: string; type: 'directory' | 'file'; rel: string }> = []
    const budget = { remaining: 100 }
    await buildTreeNodes(dir, '', 1, budget, out)
    const rels = out.map((e) => e.rel)
    expect(rels).toEqual(expect.arrayContaining(['a.txt', 'dir1', 'dir2']))
    expect(rels).toContain('dir1/b.txt')
    expect(rels).toContain('dir1/sub')
    expect(rels).toContain('dir2/d.txt')
    expect(rels).not.toContain('dir1/sub/c.txt')
  })

  it('respects the entry budget', async () => {
    const out: Array<{ name: string; type: 'directory' | 'file'; rel: string }> = []
    const budget = { remaining: 4 }
    await buildTreeNodes(dir, '', 3, budget, out)
    expect(out.length).toBe(4)
    expect(budget.remaining).toBe(0)
  })

  it('returns immediately when the budget is exhausted', async () => {
    const out: Array<{ name: string; type: 'directory' | 'file'; rel: string }> = []
    const budget = { remaining: 0 }
    await buildTreeNodes(dir, '', 3, budget, out)
    expect(out.length).toBe(0)
  })

  it('excludes noise directories', async () => {
    await mkdir(join(dir, 'node_modules'))
    await writeFile(join(dir, 'node_modules/x.js'), 'x')
    const out: Array<{ name: string; type: 'directory' | 'file'; rel: string }> = []
    const budget = { remaining: 100 }
    await buildTreeNodes(dir, '', 2, budget, out)
    expect(out.map((e) => e.rel)).not.toContain('node_modules')
  })
})