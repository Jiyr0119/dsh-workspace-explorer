/**
 * dsh-workspace-explorer — Host 半区(原生包)
 *
 * 通过 webServer 注册 /dsh-we/api/* JSON 路由(list/peek),供浏览器客户端调用。
 * 结构镜像 dsh-better-sidebar 的第三方 Host 模式:webServer.register({kind,path,handler})。
 */
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { Context } from 'cordis'

/** 请求面(结构子集:URL/method/headers + 异步 body 迭代)。 */
export interface WsHttpRequest {
  url?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  [Symbol.asyncIterator](): AsyncIterator<string | Uint8Array>
}

/** 响应面(结构子集:status/header/body 写)。 */
export interface WsHttpResponse {
  statusCode: number
  writeHead(status: number, headers?: Record<string, string>): void
  end(body?: string | Uint8Array): void
}

/** 一行目录条目。 */
export interface WsEntry {
  name: string
  type: 'directory' | 'file'
  path: string
  rel: string
  size: number | null
}

/** cordis Context 增强:webServer 路由注册面(镜像 @deepseek-ai/dsh-host-webserver 的 WebRoute)。 */
declare module 'cordis' {
  interface Context {
    webServer: {
      register(route: { kind: 'exact' | 'prefix'; path: string; handler: (req: WsHttpRequest, res: WsHttpResponse) => void | Promise<void> }): void
      register(route: Array<{ kind: 'exact' | 'prefix'; path: string; handler: (req: WsHttpRequest, res: WsHttpResponse) => void | Promise<void> }>): void
    }
  }
}

const IGNORED = new Set(['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.pytest_cache', '.ruff_cache', '.mypy_cache', 'dist', 'build', '.next', '.nuxt', 'coverage', '.idea', 'target'])
const MAX = 400
const PEEK_MAX_BYTES = 200 * 1024
const PEEK_MAX_LINES = 60

async function readJsonBody(req: WsHttpRequest): Promise<Record<string, unknown>> {
  let raw = ''
  for await (const chunk of req) raw += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf-8')
  try {
    const parsed = JSON.parse(raw) as unknown
    return parsed !== null && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

function writeJson(res: WsHttpResponse, value: unknown, status = 200): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' })
  res.end(JSON.stringify(value))
}

/** 列一个目录层级(目录优先、按名排序、噪声目录过滤、400 上限)。 */
async function listDir(abs: string, baseRel: string): Promise<{ entries: WsEntry[]; truncated: boolean }> {
  const dirents = await readdir(abs, { withFileTypes: true })
  const out: WsEntry[] = []
  for (const d of dirents) {
    if (d.name === '.DS_Store') continue
    if (d.isDirectory() && IGNORED.has(d.name)) continue
    const target = join(abs, d.name)
    let size: number | null = null
    if (d.isFile()) {
      try { size = (await stat(target)).size } catch { /* 忽略 stat 失败 */ }
    }
    out.push({ name: d.name, type: d.isDirectory() ? 'directory' : 'file', path: target, rel: baseRel === '' ? d.name : baseRel + '/' + d.name, size })
  }
  out.sort((a, b) => (a.type !== b.type ? (a.type === 'directory' ? -1 : 1) : a.name.localeCompare(b.name)))
  const truncated = out.length > MAX
  return { entries: truncated ? out.slice(0, MAX) : out, truncated }
}

export default {
  inject: ['webServer'],
  apply(ctx: Context) {
    ctx.webServer.register([
      {
        kind: 'exact',
        path: '/dsh-we/api/list',
        handler: async (req, res) => {
          const body = await readJsonBody(req)
          const root = String(body.path ?? '')
          const rel = String(body.rel ?? '')
          if (root === '') return writeJson(res, { ok: false, error: 'missing-path' })
          if (rel !== '') {
            const segs = rel.split('/')
            if (segs.some((s) => s === '' || s === '.' || s === '..')) return writeJson(res, { ok: false, error: 'bad-rel' })
          }
          const abs = rel === '' ? root : root.replace(/\/+$/, '') + '/' + rel
          try {
            const { entries, truncated } = await listDir(abs, rel)
            return writeJson(res, { ok: true, path: abs, rel, entries, truncated })
          } catch (err) {
            return writeJson(res, { ok: false, error: err instanceof Error ? err.message : String(err) })
          }
        },
      },
      {
        kind: 'exact',
        path: '/dsh-we/api/peek',
        handler: async (req, res) => {
          const body = await readJsonBody(req)
          const path = String(body.path ?? '')
          if (path === '') return writeJson(res, { ok: false, error: 'missing-path' })
          try {
            const info = await stat(path)
            const size = info.size
            if (size > PEEK_MAX_BYTES) return writeJson(res, { ok: true, tooLarge: true, binary: false, size, lineCount: 0, content: '', truncatedLines: false })
            const text = (await readFile(path)).toString('utf-8')
            const binary = text.includes('\u0000')
            const lines = text.split('\n')
            const head = lines.slice(0, PEEK_MAX_LINES).join('\n')
            return writeJson(res, {
              ok: true, tooLarge: false, binary, size,
              content: head, truncatedLines: lines.length > PEEK_MAX_LINES, lineCount: lines.length,
            })
          } catch (err) {
            return writeJson(res, { ok: false, error: err instanceof Error ? err.message : String(err) })
          }
        },
      },
    ])
  },
}
