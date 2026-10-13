/**
 * 原生文件管理器集成(revealWorkspacePath / nativeRevealStatus)单元测试。
 *
 * 注意:只测路径校验失败路径 —— 校验成功的 reveal 会真的打开访达/资源管理器,
 * 不适合在自动化测试里执行。
 */
import { describe, expect, it } from 'vitest'
import { nativeRevealStatus, revealWorkspacePath } from '../src/index'

describe('revealWorkspacePath (validation only)', () => {
  it('rejects a missing root before touching the desktop', async () => {
    expect(await revealWorkspacePath('', 'a.txt')).toEqual({ ok: false, error: 'missing-root' })
  })

  it('rejects dangerous relative path segments', async () => {
    expect(await revealWorkspacePath('/tmp', '../x')).toEqual({ ok: false, error: 'bad-rel' })
    expect(await revealWorkspacePath('/tmp', 'a/../b')).toEqual({ ok: false, error: 'bad-rel' })
  })
})

describe('nativeRevealStatus', () => {
  it('answers with a boolean capability and a known file-manager kind', () => {
    const status = nativeRevealStatus()
    expect(typeof status.ok).toBe('boolean')
    expect(status.fileManager === null || ['finder', 'explorer', 'directory'].includes(status.fileManager)).toBe(true)
  })
})
