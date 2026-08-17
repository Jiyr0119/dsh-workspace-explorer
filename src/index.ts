/**
 * dsh-workspace-explorer — Host 半区(原生包)
 *
 * 通过 webServer 注册 /dsh-we/api/* JSON 路由(list/peek/tree/config),供浏览器客户端调用。
 * - list : 列一个目录层级(懒加载)
 * - peek : 按行分页读取文本文件(offset/limit),支持「插入完整内容」(whole,≤32KB)
 * - tree : 递归生成目录树节点(限深/限条目),供目录拖拽与多选批量插入
 * - config: 运行期配置(噪声目录 / 最大条目 / 预览行数)
 */
import { open, readdir, readFile, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'
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
      register(route: { kind: 'exact' | 'prefix'; path: string; handler: (req: WsHttpRequest, res: WsHttpResponse) => void | Promise<void> }): () => void
    }
  }
}

const DEFAULT_IGNORED = ['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.pytest_cache', '.ruff_cache', '.mypy_cache', 'dist', 'build', '.next', '.nuxt', 'coverage', '.idea', 'target']
// 运行期配置:客户端 POST /dsh-we/api/config 可实时调整(噪声目录 / 最大条目 / 预览行数)
const cfg = {
  ignore: [...DEFAULT_IGNORED],
  max: 400,
  peekMaxLines: 60,
}

const WHOLE_MAX_BYTES = 32 * 1024          // 「插入完整内容」上限
const SMALL_FILE_MAX = 4 * 1024 * 1024     // 整读阈值:小于它直接 split 行,行数精确
const PAGE_SCAN_CHUNK = 256 * 1024         // 大文件分页扫描的块大小
const TREE_MAX_DEPTH = 6                   // 目录树最大递归深度
const TREE_MAX_ENTRIES = 200               // 目录树默认条目预算

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
    if (d.isDirectory() && cfg.ignore.includes(d.name)) continue
    const target = join(abs, d.name)
    let size: number | null = null
    if (d.isFile()) {
      try { size = (await stat(target)).size } catch { /* 忽略 stat 失败 */ }
    }
    out.push({ name: d.name, type: d.isDirectory() ? 'directory' : 'file', path: target, rel: baseRel === '' ? d.name : baseRel + '/' + d.name, size })
  }
  out.sort((a, b) => (a.type !== b.type ? (a.type === 'directory' ? -1 : 1) : a.name.localeCompare(b.name)))
  const truncated = out.length > cfg.max
  return { entries: truncated ? out.slice(0, cfg.max) : out, truncated }
}

/**
 * 按行读取 [offset, offset+limit) 一页内容。
 * 小文件(≤4MB)整读、行数精确;大文件块扫描定位行区间,行数未知(null)。
 */
async function readLinesPage(abs: string, offset: number, limit: number): Promise<{ content: string; startLine: number; lineCount: number | null; hasMore: boolean }> {
  const info = await stat(abs)
  const size = info.size
  if (size <= SMALL_FILE_MAX) {
    const text = (await readFile(abs)).toString('utf-8')
    const lines = text.split('\n')
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
    const page = lines.slice(offset, offset + limit)
    return { content: page.join('\n'), startLine: offset, lineCount: lines.length, hasMore: offset + page.length < lines.length }
  }
  const fh = await open(abs, 'r')
  try {
    let pos = 0
    let newlines = 0
    let startByte = offset === 0 ? 0 : -1
    let endByte = -1
    while (pos < size && endByte === -1) {
      const want = Math.min(PAGE_SCAN_CHUNK, size - pos)
      const chunk = Buffer.allocUnsafe(want)
      await fh.read(chunk, 0, want, pos)
      let idx = chunk.indexOf(0x0a)
      while (idx !== -1) {
        newlines++
        if (newlines === offset) startByte = pos + idx + 1
        if (newlines === offset + limit) { endByte = pos + idx + 1; break }
        idx = chunk.indexOf(0x0a, idx + 1)
      }
      pos += want
    }
    if (startByte === -1) startByte = size
    if (endByte === -1) endByte = size
    const len = endByte - startByte
    const buf = len > 0 ? Buffer.allocUnsafe(len) : Buffer.alloc(0)
    if (len > 0) await fh.read(buf, 0, len, startByte)
    return { content: buf.toString('utf-8').replace(/\n$/, ''), startLine: offset, lineCount: null, hasMore: endByte < size }
  } finally {
    await fh.close()
  }
}

/** 嗅探是否二进制(NUL 字节),只读前 8KB。 */
async function sniffBinary(abs: string, size: number): Promise<boolean> {
  const probe = Buffer.alloc(Math.min(8192, size))
  if (probe.length === 0) return false
  const fh = await open(abs, 'r')
  try { await fh.read(probe, 0, probe.length, 0) } finally { await fh.close() }
  return probe.includes(0)
}

/** 递归收集目录树节点(树根相对 rel 从 '' 开始;受深度/条目预算限制)。 */
async function buildTreeNodes(
  abs: string, rel: string, depth: number, budget: { remaining: number },
  out: Array<{ name: string; type: 'directory' | 'file'; rel: string }>,
): Promise<void> {
  if (depth < 0 || budget.remaining <= 0) return
  const { entries } = await listDir(abs, rel)
  for (const e of entries) {
    if (budget.remaining <= 0) break
    out.push({ name: e.name, type: e.type, rel: e.rel })
    budget.remaining--
    if (e.type === 'directory') await buildTreeNodes(e.path, e.rel, depth - 1, budget, out)
  }
}

export default {
  inject: ['webServer'],
  apply(ctx: Context) {
    const routes: Array<{ kind: 'exact' | 'prefix'; path: string; handler: (req: WsHttpRequest, res: WsHttpResponse) => void | Promise<void> }> = [
      {
        kind: 'exact',
        path: '/dsh-we/api/config',
        handler: async (req, res) => {
          const body = await readJsonBody(req)
          if (Array.isArray(body.ignore)) cfg.ignore = body.ignore.map((s) => String(s)).filter((s) => s !== '')
          if (typeof body.max === 'number' && body.max >= 1 && body.max <= 2000) cfg.max = Math.floor(body.max)
          if (typeof body.peekMaxLines === 'number' && body.peekMaxLines >= 10 && body.peekMaxLines <= 500) cfg.peekMaxLines = Math.floor(body.peekMaxLines)
          return writeJson(res, { ok: true, ignore: cfg.ignore, max: cfg.max, peekMaxLines: cfg.peekMaxLines })
        },
      },
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
            const binary = await sniffBinary(path, size)
            if (binary) return writeJson(res, { ok: true, binary: true, size, lineCount: null, startLine: 0, content: '', hasMore: false })
            // whole:小文件(≤32KB)直接返回完整内容,供「插入内容」
            if (body.whole === true && size <= WHOLE_MAX_BYTES) {
              const lines = (await readFile(path)).toString('utf-8').split('\n')
              if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
              return writeJson(res, { ok: true, binary: false, size, lineCount: lines.length, startLine: 0, content: lines.join('\n'), hasMore: false })
            }
            const offset = Math.max(0, Math.floor(Number(body.offset) || 0))
            const limit = Math.min(2000, Math.max(1, Math.floor(Number(body.limit) || cfg.peekMaxLines)))
            const page = await readLinesPage(path, offset, limit)
            return writeJson(res, { ok: true, binary: false, size, ...page })
          } catch (err) {
            return writeJson(res, { ok: false, error: err instanceof Error ? err.message : String(err) })
          }
        },
      },
      {
        kind: 'exact',
        path: '/dsh-we/api/tree',
        handler: async (req, res) => {
          const body = await readJsonBody(req)
          const path = String(body.path ?? '')
          if (path === '') return writeJson(res, { ok: false, error: 'missing-path' })
          const depth = Math.min(TREE_MAX_DEPTH, Math.max(1, Math.floor(Number(body.depth) || 3)))
          const maxEntries = Math.min(1000, Math.max(1, Math.floor(Number(body.maxEntries) || TREE_MAX_ENTRIES)))
          try {
            const name = basename(path.replace(/\/+$/, '')) || basename(path)
            const entries: Array<{ name: string; type: 'directory' | 'file'; rel: string }> = []
            const budget = { remaining: maxEntries }
            await buildTreeNodes(path, '', depth, budget, entries)
            return writeJson(res, { ok: true, name, entries, entryCount: entries.length, truncated: budget.remaining <= 0 })
          } catch (err) {
            return writeJson(res, { ok: false, error: err instanceof Error ? err.message : String(err) })
          }
        },
      },
    ]
    // 真实 webServer.register 只接受单个 route(数组会被静默塞进前缀表导致路由失效)
    for (const route of routes) ctx.webServer.register(route)
  },
}
