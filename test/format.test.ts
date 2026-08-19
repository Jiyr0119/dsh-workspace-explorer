import { describe, expect, it } from 'vitest'
import { basename, extOf, fmtSize, formatTreeBlock } from '../src/client/format'

describe('fmtSize', () => {
  it('renders bytes under 1KB', () => {
    expect(fmtSize(0)).toBe('0 B')
    expect(fmtSize(999)).toBe('999 B')
  })

  it('renders KB', () => {
    expect(fmtSize(1024)).toBe('1.0 KB')
    expect(fmtSize(2048)).toBe('2.0 KB')
  })

  it('renders MB', () => {
    expect(fmtSize(1048576)).toBe('1.0 MB')
    expect(fmtSize(1572864)).toBe('1.5 MB')
  })

  it('renders empty string for nullish', () => {
    expect(fmtSize(null)).toBe('')
    expect(fmtSize(undefined)).toBe('')
  })
})

describe('basename', () => {
  it('strips the directory portion', () => {
    expect(basename('/a/b/c.ts')).toBe('c.ts')
    expect(basename('a.txt')).toBe('a.txt')
    expect(basename('/root')).toBe('root')
  })

  it('handles trailing slashes', () => {
    expect(basename('/a/b/')).toBe('b')
    expect(basename('//')).toBe('')
  })
})

describe('extOf', () => {
  it('extracts lowercase extension', () => {
    expect(extOf('foo.ts')).toBe('ts')
    expect(extOf('foo.TSX')).toBe('tsx')
    expect(extOf('archive.tar.gz')).toBe('gz')
  })

  it('returns empty for dotfiles and extension-less names', () => {
    expect(extOf('.gitignore')).toBe('')
    expect(extOf('Makefile')).toBe('')
    expect(extOf('noext')).toBe('')
  })
})

describe('formatTreeBlock', () => {
  it('renders a bare root', () => {
    expect(formatTreeBlock('ws', [], false)).toBe('ws/')
  })

  it('renders nested entries with tree glyphs', () => {
    const entries = [
      { rel: 'a.txt', name: 'a.txt', type: 'file' },
      { rel: 'dir', name: 'dir', type: 'directory' },
      { rel: 'dir/b.ts', name: 'b.ts', type: 'file' },
    ]
    expect(formatTreeBlock('ws', entries, false)).toBe([
      'ws/',
      '├── a.txt',
      '└── dir/',
      '    └── b.ts',
    ].join('\n'))
  })

  it('renders multiple siblings with correct pipe indentation', () => {
    const entries = [
      { rel: 'dir1', name: 'dir1', type: 'directory' },
      { rel: 'dir1/x', name: 'x', type: 'file' },
      { rel: 'dir2', name: 'dir2', type: 'directory' },
      { rel: 'dir2/y', name: 'y', type: 'file' },
    ]
    expect(formatTreeBlock('ws', entries, false)).toBe([
      'ws/',
      '├── dir1/',
      '│   └── x',
      '└── dir2/',
      '    └── y',
    ].join('\n'))
  })

  it('appends a truncation marker', () => {
    expect(formatTreeBlock('ws', [], true)).toBe('ws/\n…')
  })
})