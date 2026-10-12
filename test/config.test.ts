/**
 * Host 侧 Config schema(settings 域持久化配置)单元测试:
 * 字段集合 / volatile 元数据 / 默认值 / 合法覆盖 / 非法拒绝。
 * 字段集合必须与客户端 WsCfg 保持一致(见 src/client/index.tsx)。
 */
import { describe, expect, it } from 'vitest'
import { Config } from '../src/index'

interface VolatileHandle { get(): unknown }
type Resolved = Record<string, VolatileHandle>

// schemastery 的调用签名按字面量形状收窄入参;测试需要接受任意输入,故在边界放宽类型。
const call = Config as unknown as (raw: unknown) => Resolved
const resolve = (raw: unknown): Resolved => call(raw)

describe('Config(settings 域 schema)', () => {
  it('字段集合与顺序与面板设置一致,且全部标记 volatile', () => {
    // toJSON() 会把子节点折叠成 uid refs 表,这里直接读 schema 实例的 dict。
    const dict = (Config as unknown as { dict?: Record<string, { meta?: Record<string, unknown> }> }).dict
    expect(Object.keys(dict ?? {})).toEqual(['hideNoise', 'showSize', 'refStyle', 'peekLines', 'width'])
    for (const field of ['hideNoise', 'showSize', 'refStyle', 'peekLines', 'width']) {
      expect(dict?.[field]?.meta?.volatile, `${field} must be volatile`).toBe(true)
    }
  })

  it('默认值与面板默认一致(空配置 → volatile 句柄)', () => {
    const cfg = resolve({})
    expect(typeof cfg.hideNoise.get).toBe('function')
    expect(cfg.hideNoise.get()).toBe(true)
    expect(cfg.showSize.get()).toBe(true)
    expect(cfg.refStyle.get()).toBe('relative')
    expect(cfg.peekLines.get()).toBe(60)
    expect(cfg.width.get()).toBe(384)
  })

  it('合法覆盖生效', () => {
    const cfg = resolve({ hideNoise: false, showSize: false, refStyle: 'absolute', peekLines: 120, width: 480 })
    expect(cfg.hideNoise.get()).toBe(false)
    expect(cfg.showSize.get()).toBe(false)
    expect(cfg.refStyle.get()).toBe('absolute')
    expect(cfg.peekLines.get()).toBe(120)
    expect(cfg.width.get()).toBe(480)
  })

  it('非法取值被拒绝(union 枚举约束)', () => {
    expect(() => resolve({ refStyle: 'bogus' })).toThrow()
    expect(() => resolve({ peekLines: 9999 })).toThrow()
    expect(() => resolve({ width: 500 })).toThrow()
    expect(() => resolve({ hideNoise: 'yes' })).toThrow()
  })
})
