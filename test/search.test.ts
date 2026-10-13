/**
 * searchContent(工作区内容搜索)单元测试:
 * 大小写不敏感子串匹配 / 片段窗口 / 噪声目录跳过 / 二进制跳过 / 各上限与 truncated。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cfg, searchContent } from '../src/index'

let dir: string

const originalIgnore = cfg.ignore.slice()

beforeEach(async () => {
  cfg.ignore = originalIgnore.slice()
  dir = await mkdtemp(join(tmpdir(), 'dshwe-search-'))
})

afterEach(async () => {
  cfg.ignore = originalIgnore.slice()
  await rm(dir, { recursive: true, force: true })
})

describe('searchContent', () => {
  it('matches case-insensitively and reports line / snippet window', async () => {
    await writeFile(join(dir, 'a.ts'), ['const x = 1', 'export function lookupTable() {', 'return null', ''].join('\n'))
    const res = await searchContent(dir, 'LOOKUPTABLE')
    expect(res.ok).toBe(true)
    expect(res.hits).toHaveLength(1)
    const hit = res.hits[0]
    expect(hit.rel).toBe('a.ts')
    expect(hit.name).toBe('a.ts')
    expect(hit.line).toBe(2)
    expect(hit.text).toContain('lookupTable')
    expect(hit.text.slice(hit.start, hit.end).toLowerCase()).toBe('lookuptable')
    expect(res.truncated).toBe(false)
  })

  it('searches nested files with rel paths', async () => {
    await mkdir(join(dir, 'src'))
    await writeFile(join(dir, 'src', 'util.md'), 'a unique marker inside nested file\n')
    const res = await searchContent(dir, 'unique marker')
    expect(res.hits.map((h) => h.rel)).toEqual(['src/util.md'])
  })

  it('always skips noise dirs even when cfg.ignore is empty', async () => {
    cfg.ignore = []
    await mkdir(join(dir, 'node_modules'))
    await writeFile(join(dir, 'node_modules', 'pkg.js'), 'needle in dependency\n')
    await writeFile(join(dir, 'app.js'), 'needle in app\n')
    const res = await searchContent(dir, 'needle')
    expect(res.hits.map((h) => h.rel)).toEqual(['app.js'])
  })

  it('skips binary files', async () => {
    await writeFile(join(dir, 'blob.bin'), Buffer.from([0x6e, 0x65, 0x65, 0x64, 0x6c, 0x65, 0x00, 0x01]))
    await writeFile(join(dir, 'text.txt'), 'needle here\n')
    const res = await searchContent(dir, 'needle')
    expect(res.hits.map((h) => h.rel)).toEqual(['text.txt'])
  })

  it('skips files above maxFileBytes', async () => {
    await writeFile(join(dir, 'big.txt'), 'x'.repeat(64) + ' needle')
    const res = await searchContent(dir, 'needle', { maxFileBytes: 16 })
    expect(res.hits).toHaveLength(0)
    expect(res.ok).toBe(true)
  })

  it('caps hits at maxHits and reports truncated', async () => {
    for (let i = 0; i < 5; i++) await writeFile(join(dir, `f${i}.txt`), 'needle\n')
    const res = await searchContent(dir, 'needle', { maxHits: 3 })
    expect(res.hits).toHaveLength(3)
    expect(res.truncated).toBe(true)
  })

  it('caps per-file matches at maxPerFile', async () => {
    await writeFile(join(dir, 'many.txt'), Array.from({ length: 6 }, () => 'needle').join('\n'))
    const res = await searchContent(dir, 'needle', { maxPerFile: 2 })
    expect(res.hits).toHaveLength(2)
    expect(res.hits.map((h) => h.line)).toEqual([1, 2])
    expect(res.truncated).toBe(false)
  })

  it('caps scanned files at maxFiles and reports truncated', async () => {
    for (let i = 0; i < 4; i++) await writeFile(join(dir, `f${i}.txt`), 'nothing here\n')
    const res = await searchContent(dir, 'needle', { maxFiles: 2 })
    expect(res.hits).toHaveLength(0)
    expect(res.scanned).toBeGreaterThanOrEqual(2)
    expect(res.truncated).toBe(true)
  })

  it('returns an empty success for an empty query', async () => {
    await writeFile(join(dir, 'a.txt'), 'needle\n')
    const res = await searchContent(dir, '   ')
    expect(res).toEqual({ ok: true, hits: [], scanned: 0, truncated: false })
  })

  it('rejects a missing root', async () => {
    const res = await searchContent('', 'x')
    expect(res.ok).toBe(false)
    expect(res.error).toBe('missing-root')
  })
})
