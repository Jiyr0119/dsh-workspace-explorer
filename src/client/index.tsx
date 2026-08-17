/**
 * dsh-workspace-explorer — Client 半区(原生包)
 *
 * 浏览器 bundle(src/client/index.tsx → lib/client.js,__ModuleLoader__ 格式)。
 * 通过 /dsh-we/api/* JSON 路由调用 Host;注册 shell.overlay / sidebar.footer.action /
 * conversation.input.dock 三个槽位,与动态版功能一致(树/搜索/预览/i18n/拖拽)。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './panel.module.css'

const MARKER = 'application/x-dsh-ws-file'
const C = (k: string): string => styles[k] ?? k

// ---------- 与 Host 的 JSON RPC(fetch 版 host.call) ----------
async function api<T = unknown>(method: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/dsh-we/api/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json() as Promise<T>
}

// ---------- 国际化(跟随 DSH 界面语言,与动态版一致) ----------
const NS = 'dsh-workspace-explorer'
const DICTS: Record<string, Record<string, string>> = {
  zh: {
    'panel.title': '工作区文件', 'ws.current': '当前目录', 'search.ph': '搜索文件(仅已加载目录)…',
    hint: '点击文件或拖拽到输入框,发送给模型', 'empty.title': '还没有可浏览的工作区。选择一个项目文件夹,即可在这里查看目录文件。',
    'empty.add': '+ 选择文件夹作为工作区', 'loading.ws': '正在加载工作区…', hit: '匹配 {n} 项',
    'hit.none': '没有匹配「{q}」的文件(搜索范围:已加载目录)', truncated: '已截断,仅显示前 {n} 项',
    loading: '加载中…', 'load.fail': '加载失败: ', read: '读取中…', 'read.fail': '读取失败: ',
    'too.large': '文件过大({s}),仅支持插入引用', binary: '二进制文件,仅支持插入引用',
    'lines.tail': '…(共 {n} 行,仅显示前 60 行)', 'btn.ref': '插入引用', 'btn.content': '插入内容',
    'btn.content.tip': '把文件内容插入输入框', 'btn.content.no': '文件过大或二进制,无法内联',
    'sidebar.tooltip': '工作区文件', 'sidebar.label': '文件', refresh: '刷新', close: '关闭',
    'close.preview': '关闭预览', 'row.tip': '点击或拖拽到输入框', 'preview.tip': '预览 (P)',
    'insert.tip': '插入引用', 'drop.hint': '松开以插入文件引用到输入框', 'add.ws': '添加工作区',
  },
  en: {
    'panel.title': 'Workspace Files', 'ws.current': 'Current dir', 'search.ph': 'Search files (loaded dirs only)…',
    hint: 'Click a file or drag it into the composer to send', 'empty.title': 'No browsable workspace yet. Pick a project folder to view its files.',
    'empty.add': '+ Choose a folder as workspace', 'loading.ws': 'Loading workspaces…', hit: '{n} match(es)',
    'hit.none': 'No files match "{q}" (search covers loaded dirs)', truncated: 'Truncated: showing the first {n}',
    loading: 'Loading…', 'load.fail': 'Load failed: ', read: 'Reading…', 'read.fail': 'Read failed: ',
    'too.large': 'File too large ({s}); reference only', binary: 'Binary file; reference only',
    'lines.tail': '…({n} lines total, showing the first 60)', 'btn.ref': 'Insert reference', 'btn.content': 'Insert content',
    'btn.content.tip': 'Insert the file content into the composer', 'btn.content.no': 'Too large or binary — cannot inline',
    'sidebar.tooltip': 'Workspace Files', 'sidebar.label': 'Files', refresh: 'Refresh', close: 'Close',
    'close.preview': 'Close preview', 'row.tip': 'click or drag to the composer', 'preview.tip': 'Preview (P)',
    'insert.tip': 'Insert reference', 'drop.hint': 'Release to insert the file reference into the composer', 'add.ws': 'Add workspace',
  },
}

interface LocaleLike {
  register(ns: string, locale: string, dict: Record<string, string>): () => void
  bind(ns: string): (key: string) => string
}

// ---------- 图标 ----------
const FOLDER_D = 'M1.5 2.5A1.5 1.5 0 0 1 3 1h3.2l1.6 2H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5v-9z'
const DOC_BODY = 'M4.3 1.7h5.3l2.7 2.7v8.9a1 1 0 0 1-1 1H4.3a1 1 0 0 1-1-1V2.7a1 1 0 0 1 1-1z'
const DOC_FOLD = 'M9.6 1.7L12.3 4.4H9.6z'
const GLYPHS: Record<string, string> = {
  code: 'M6.4 6.1L4.9 8l1.5 1.9M9.6 6.1l1.5 1.9L9.6 9.9',
  image: 'M3.6 12.4l2.7-2.7 1.8 1.8 1.5-1.5 2.8 2.4M5.4 6.4a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z',
  markdown: 'M5.1 11.2l1.9-2.9 1.9 2.9M5.1 8.4h3.8',
  config: 'M3.2 5.6h3.6M9 5.6h3.8M3.2 10.4h3.6M9 10.4h3.8M7.4 3.8v3.6M7.4 8.6v3.6',
  css: 'M6.2 4.4v7.2M9.8 4.4v7.2M4.9 6.9h6.2M4.9 9.1h6.2',
  shell: 'M3.6 5.4l2.4 2.6L3.6 10.6M8.1 10.6h4.3',
  plain: '',
}
const FILE_META: Record<string, [string, string]> = {
  ts: ['#3178c6', 'code'], tsx: ['#3178c6', 'code'], mts: ['#3178c6', 'code'], cts: ['#3178c6', 'code'],
  js: ['#d4a72c', 'code'], jsx: ['#d4a72c', 'code'], mjs: ['#d4a72c', 'code'], cjs: ['#d4a72c', 'code'],
  py: ['#3572a5', 'code'], pyi: ['#3572a5', 'code'], rs: ['#e0a15e', 'code'], go: ['#00add8', 'code'],
  java: ['#b07219', 'code'], rb: ['#cc342d', 'code'], php: ['#777bb4', 'code'], swift: ['#f05138', 'code'], kt: ['#7f52ff', 'code'],
  sh: ['#4c9a4a', 'shell'], bash: ['#4c9a4a', 'shell'], zsh: ['#4c9a4a', 'shell'],
  json: ['#c9a227', 'config'], yml: ['#5b7c99', 'config'], yaml: ['#5b7c99', 'config'], toml: ['#5b7c99', 'config'], ini: ['#5b7c99', 'config'], env: ['#5b7c99', 'config'], cfg: ['#5b7c99', 'config'], conf: ['#5b7c99', 'config'],
  md: ['#4f8ac9', 'markdown'], mdx: ['#4f8ac9', 'markdown'], txt: ['#8a919c', 'plain'], rst: ['#4f8ac9', 'markdown'],
  css: ['#2965f1', 'css'], scss: ['#c6538c', 'css'], less: ['#1d70b8', 'css'],
  html: ['#e34c26', 'code'], htm: ['#e34c26', 'code'], xml: ['#e34c26', 'code'],
  svg: ['#5a67d8', 'image'], png: ['#5a67d8', 'image'], jpg: ['#5a67d8', 'image'], jpeg: ['#5a67d8', 'image'], gif: ['#5a67d8', 'image'], webp: ['#5a67d8', 'image'], ico: ['#5a67d8', 'image'], avif: ['#5a67d8', 'image'],
  sql: ['#c98a1b', 'config'],
}
const DEFAULT_META: [string, string] = ['#8a919c', 'plain']

interface WsEntry {
  name: string
  type: 'directory' | 'file'
  path: string
  rel: string
  size: number | null
}
interface ListResult { ok: boolean; error?: string; path?: string; rel?: string; entries?: WsEntry[]; truncated?: boolean }
interface PeekResult {
  ok: boolean; error?: string; tooLarge?: boolean; binary?: boolean; size?: number
  lineCount?: number; content?: string; truncatedLines?: boolean
}

const fmtSize = (n: number | null | undefined): string => {
  if (n == null) return ''
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}
const basename = (p: string): string => { const s = p.replace(/\/+$/, ''); const i = s.lastIndexOf('/'); return i >= 0 ? s.slice(i + 1) : s }
const extOf = (name: string): string => { const i = name.lastIndexOf('.'); return i <= 0 ? '' : name.slice(i + 1).toLowerCase() }

function FolderSvg({ open }: { open: boolean }) {
  return <svg viewBox="0 0 16 16" width={16} height={16} className={C('dshwe-ico dshwe-folder-svg')} aria-hidden="true">
    <path d={FOLDER_D} fill={open ? '#e8c47c' : '#dcb67a'} />
  </svg>
}
function FileSvg({ color, glyph }: { color: string; glyph: string }) {
  return <svg viewBox="0 0 16 16" width={16} height={16} className={C('dshwe-ico')} aria-hidden="true">
    <path d={DOC_BODY} fill={color} />
    <path d={DOC_FOLD} fill="rgba(255,255,255,.92)" />
    {glyph !== '' ? <path d={glyph} fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /> : null}
  </svg>
}
function ChevronSvg({ open }: { open: boolean }) {
  return <svg viewBox="0 0 16 16" width={14} height={14} className={C('dshwe-chev') + (open ? ` ${C('dshwe-chev-on')}` : '')} aria-hidden="true">
    <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

function iconFor(entry: WsEntry, open: boolean): React.ReactNode {
  if (entry.type === 'directory') return <FolderSvg open={open} />
  const meta = FILE_META[extOf(entry.name)] ?? DEFAULT_META
  return <FileSvg color={meta[0]} glyph={GLYPHS[meta[1]] ?? ''} />
}

// ---------- 共享状态(面板开关 / 输入桥) ----------
const openListeners = new Set<(v: boolean) => void>()
let open = false
const getOpen = (): boolean => open
const setOpen = (v: boolean): void => { open = v; openListeners.forEach((fn) => fn(open)) }
const subscribeOpen = (fn: (v: boolean) => void): (() => void) => { openListeners.add(fn); return () => { openListeners.delete(fn) } }

let bridge: { insert(text: string): void } | null = null
const setBridge = (b: { insert(text: string): void } | null): void => { bridge = b }
const getBridge = () => bridge

// ---------- 侧边栏开关按钮 ----------
function SidebarAction(props: { wide?: boolean }) {
  const [on, setOnState] = useState(getOpen())
  useEffect(() => subscribeOpen(setOnState), [])
  return (
    <button type="button" className={C('dshwe-act') + (on ? ` ${C('dshwe-act-on')}` : '')}
      onClick={() => setOpen(!getOpen())} title={tr('sidebar.tooltip')} aria-label={tr('sidebar.tooltip')} aria-pressed={on}>
      <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true"><path d={FOLDER_D} fill="currentColor" /></svg>
      {props.wide === true ? <span>{tr('sidebar.label')}</span> : null}
    </button>
  )
}

// ---------- 输入桥(捕获 inputActions) ----------
function DockBridge(props: { useInput?: (s: unknown) => unknown; inputActions?: { setDraft(d: string): void } }) {
  const input = props.useInput ? (props.useInput((s: unknown) => s) as { draft?: string }) : undefined
  const actions = props.inputActions
  const draftRef = useRef(input?.draft ?? '')
  draftRef.current = input?.draft ?? ''
  useEffect(() => {
    if (!actions) return
    setBridge({
      insert(text: string) {
        const draft = draftRef.current
        const sep = draft === '' || draft.endsWith('\n') ? '' : '\n'
        actions.setDraft(draft + sep + text)
      },
    })
  }, [actions])
  return null
}

// ---------- 右侧面板 ----------
function Panel(props: {
  useWorkspaces: (s: unknown) => unknown
  useSessions: (s: unknown) => unknown
  onDraggingChange: (v: boolean) => void
}) {
  const wsState = props.useWorkspaces((s: unknown) => s) as { items?: Array<{ workspaceId: string; path: string; title: string }>; recentWorkspaceId?: string; state?: string }
  const sessions = props.useSessions((s: unknown) => s) as { current?: string; byId?: Record<string, { cwd?: string }> }
  const workspaces = wsState.items ?? []
  const currentSummary = sessions.current && sessions.byId ? sessions.byId[sessions.current] : undefined
  const cwd = currentSummary?.cwd

  const [root, setRoot] = useState<string | null>(null)
  const [dirs, setDirs] = useState<Record<string, { loading: boolean; error: string | null; entries: WsEntry[]; truncated: boolean }>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState('')
  const [preview, setPreview] = useState<{ entry: WsEntry; loading: boolean; data: PeekResult | null; error: string | null } | null>(null)

  const recentItem = workspaces.find((w) => w.workspaceId === wsState.recentWorkspaceId)
  const firstItem = workspaces[0]

  useEffect(() => {
    if (root !== null) return
    const cand = cwd ?? recentItem?.path ?? firstItem?.path
    if (cand) setRoot(cand)
  }, [root, cwd, wsState.state, recentItem, firstItem])

  const loadDir = useCallback(async (r: string, rel: string) => {
    setDirs((d) => ({ ...d, [rel]: { loading: true, error: null, entries: d[rel]?.entries ?? [], truncated: false } }))
    try {
      const res = await api<ListResult>('list', { path: r, rel })
      if (!res.ok) throw new Error(res.error ?? 'unknown')
      setDirs((d) => ({ ...d, [rel]: { loading: false, error: null, entries: res.entries ?? [], truncated: res.truncated === true } }))
    } catch (err) {
      setDirs((d) => ({ ...d, [rel]: { loading: false, error: String((err as Error)?.message ?? err), entries: [], truncated: false } }))
    }
  }, [])

  useEffect(() => {
    if (root === null) return
    setDirs({}); setExpanded({}); setPreview(null)
    void loadDir(root, '')
  }, [root, loadDir])

  const toggle = (rel: string): void => {
    const willExpand = !expanded[rel]
    setExpanded((e) => { const n = { ...e }; if (willExpand) n[rel] = true; else delete n[rel]; return n })
    if (willExpand && root) void loadDir(root, rel)
  }
  const refresh = (): void => {
    if (root === null) return
    void loadDir(root, '')
    Object.keys(expanded).forEach((rel) => { if (rel !== '') void loadDir(root, rel) })
  }
  const markerFor = (entry: WsEntry): string => root === cwd ? `[file: ${entry.rel}]` : `[file: ${entry.path}]`
  const insertMarker = (entry: WsEntry): void => { const b = getBridge(); if (b) b.insert(markerFor(entry)) }

  const openPreview = async (entry: WsEntry): Promise<void> => {
    setPreview({ entry, loading: true, data: null, error: null })
    try {
      const res = await api<PeekResult>('peek', { path: entry.path })
      if (!res.ok) throw new Error(res.error ?? 'unknown')
      setPreview({ entry, loading: false, data: res, error: null })
    } catch (err) {
      setPreview({ entry, loading: false, data: null, error: String((err as Error)?.message ?? err) })
    }
  }
  const insertContent = (): void => {
    if (!preview?.data || preview.data.tooLarge || preview.data.binary || (preview.data.size ?? 0) > 32768) return
    const b = getBridge()
    if (b) b.insert(`\n${preview.data.content ?? ''}\n`)
  }

  const onDragStart = (ev: React.DragEvent, entry: WsEntry): void => {
    ev.dataTransfer.setData('text/plain', markerFor(entry))
    ev.dataTransfer.setData(MARKER, JSON.stringify({ path: entry.path, rel: entry.rel, name: entry.name }))
    ev.dataTransfer.effectAllowed = 'copy'
    props.onDraggingChange(true)
  }

  const q = filter.trim().toLowerCase()
  const collectMatches = (rel: string, out: Array<{ entry: WsEntry }>): void => {
    const data = dirs[rel]
    if (!data) return
    for (const entry of data.entries) {
      if (entry.name.toLowerCase().includes(q)) out.push({ entry })
      if (entry.type === 'directory') collectMatches(entry.rel, out)
    }
  }

  const rowFor = (entry: WsEntry, depth: number, isExp: boolean): React.ReactNode => {
    const isDir = entry.type === 'directory'
    return (
      <button key={entry.rel} type="button"
        className={C('dshwe-row') + (isDir ? ` ${C('dshwe-row-dir')}` : ` ${C('dshwe-row-file')}`)}
        style={{ paddingLeft: 10 + depth * 16 }}
        title={entry.path + (isDir ? '' : ` · ${tr('row.tip')}`)}
        draggable={!isDir}
        onDragStart={isDir ? undefined : (ev) => onDragStart(ev, entry)}
        onClick={() => { if (isDir) toggle(entry.rel); else insertMarker(entry) }}
        onKeyDown={(ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); if (isDir) toggle(entry.rel); else insertMarker(entry) }
          else if (ev.key === 'p' && !isDir) { ev.preventDefault(); void openPreview(entry) }
        }}>
        <span className={C('dshwe-chev-slot')}>{isDir ? <ChevronSvg open={isExp} /> : null}</span>
        {iconFor(entry, isExp)}
        <span className={C('dshwe-name')}>{entry.name}</span>
        {!isDir && entry.size != null ? <span className={C('dshwe-size')}>{fmtSize(entry.size)}</span> : null}
        {!isDir ? (
          <span className={C('dshwe-eye')} title={tr('preview.tip')} role="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); void openPreview(entry) }}
            onClick={(e) => e.stopPropagation()}>
            <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true"><path d="M1.5 8s2.6-4.5 6.5-4.5S14.5 8 14.5 8 11.9 12.5 8 12.5 1.5 8 1.5 8zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" /></svg>
          </span>
        ) : null}
        {!isDir ? (
          <span className={C('dshwe-insert')} title={tr('insert.tip')}>
            <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true"><path d="M8 2.5v7.5M5.7 7.5L8 9.8l2.3-2.3M3.5 12.5h9" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        ) : null}
      </button>
    )
  }

  const renderTree = (rel: string, depth: number): React.ReactNode[] => {
    const data = dirs[rel]
    if (!data) return []
    const rows: React.ReactNode[] = []
    for (const entry of data.entries) {
      const isDir = entry.type === 'directory'
      const isExp = isDir && !!expanded[entry.rel]
      rows.push(rowFor(entry, depth, isExp))
      if (isExp) rows.push(...renderTree(entry.rel, depth + 1))
    }
    if (data.truncated) rows.push(<div key="trunc" className={C('dshwe-note')}>{tr('truncated', { n: data.entries.length })}</div>)
    if (data.loading) rows.push(<div key="load" className={C('dshwe-note')}><span className={C('dshwe-spin')} />{tr('loading')}</div>)
    if (data.error) rows.push(<div key="err" className={C('dshwe-note dshwe-note-err')}>{tr('load.fail')}{data.error}</div>)
    return rows
  }

  const addWorkspace = async (): Promise<void> => {
    // 原生版暂不开放"选择文件夹注册工作区"(依赖 workspaces 服务,后续版本补充)
  }

  let body: React.ReactNode
  if (q !== '') {
    const hits: Array<{ entry: WsEntry }> = []
    collectMatches('', hits)
    body = (
      <>
        <div className={C('dshwe-note')}>{tr('hit', { n: hits.length })}</div>
        {hits.length ? hits.map((h) => rowFor(h.entry, 0, false)) : <div className={C('dshwe-empty')}>{tr('hit.none', { q: filter })}</div>}
      </>
    )
  } else if (root === null) {
    body = (
      <div className={C('dshwe-empty')}>
        <div className={C('dshwe-empty-ico')}>
          <svg viewBox="0 0 16 16" width={17} height={17} aria-hidden="true"><path d={FOLDER_D} fill="currentColor" /></svg>
        </div>
        <div>{tr('empty.title')}</div>
      </div>
    )
  } else {
    body = <>{renderTree('', 0)}</>
  }

  const options: Array<{ value: string; label: string }> = []
  if (cwd) options.push({ value: cwd, label: `${tr('ws.current')} · ${basename(cwd)}` })
  for (const w of workspaces) options.push({ value: w.path, label: `${w.title} · ${w.path}` })
  const seen = new Set<string>()
  const uniqOptions = options.filter((o) => (seen.has(o.value) ? false : (seen.add(o.value), true)))
  const rootLabel = root ? basename(root) : ''

  let pv: React.ReactNode = null
  if (preview) {
    const d = preview.data
    let contentArea: React.ReactNode
    if (preview.loading) contentArea = <div className={C('dshwe-note')}><span className={C('dshwe-spin')} />{tr('read')}</div>
    else if (preview.error) contentArea = <div className={C('dshwe-note dshwe-note-err')}>{tr('read.fail')}{preview.error}</div>
    else if (d?.tooLarge) contentArea = <div className={C('dshwe-note')}>{tr('too.large', { s: fmtSize(d.size) })}</div>
    else if (d?.binary) contentArea = <div className={C('dshwe-note')}>{tr('binary')}</div>
    else contentArea = <pre className={C('dshwe-preview-pre')}>{d?.content}{d?.truncatedLines ? `\n${tr('lines.tail', { n: d.lineCount ?? 0 })}` : ''}</pre>
    const canInline = !preview.loading && !preview.error && !!d && !d.tooLarge && !d.binary && (d.size ?? 0) <= 32768
    pv = (
      <div className={C('dshwe-preview')}>
        <div className={C('dshwe-preview-head')}>
          <div className={C('dshwe-preview-name')}>{preview.entry.name}</div>
          <div className={C('dshwe-preview-meta')}>{preview.entry.size != null ? fmtSize(preview.entry.size) : ''}</div>
          <button type="button" className={C('dshwe-icobtn')} onClick={() => setPreview(null)} title={tr('close.preview')} aria-label={tr('close.preview')}>
            <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
          </button>
        </div>
        {contentArea}
        <div className={C('dshwe-preview-actions')}>
          <button type="button" className={C('dshwe-prevbtn')} onClick={() => insertMarker(preview.entry)}>{tr('btn.ref')}</button>
          <button type="button" className={C('dshwe-prevbtn dshwe-prevbtn-primary')} disabled={!canInline}
            title={canInline ? tr('btn.content.tip') : tr('btn.content.no')} onClick={insertContent}>{tr('btn.content')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className={C('dshwe-panel')}>
      <div className={C('dshwe-head')}>
        <span className={C('dshwe-head-ico')}>
          <svg viewBox="0 0 16 16" width={17} height={17} aria-hidden="true"><path d={FOLDER_D} fill="currentColor" /></svg>
        </span>
        <div className={C('dshwe-title')}>{tr('panel.title')}{rootLabel ? ` · ${rootLabel}` : ''}</div>
        <button type="button" className={C('dshwe-icobtn')} onClick={refresh} title={tr('refresh')} aria-label={tr('refresh')}>
          <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
        </button>
        <button type="button" className={C('dshwe-icobtn')} onClick={() => setOpen(false)} title={tr('close')} aria-label={tr('close')}>
          <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className={C('dshwe-selrow')}>
        <select className={C('dshwe-sel')} value={root ?? ''} onChange={(e) => setRoot(e.target.value)}>
          {uniqOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="button" className={C('dshwe-addbtn')} onClick={() => void addWorkspace()} title={tr('add.ws')}>+</button>
      </div>
      <div className={C('dshwe-filterrow')}>
        <input className={C('dshwe-filter')} type="text" value={filter} placeholder={tr('search.ph')} onChange={(e) => setFilter(e.target.value)} />
        {filter !== '' ? (
          <button type="button" className={C('dshwe-filter-clear')} onClick={() => setFilter('')} title={tr('close')} aria-label={tr('close')}>
            <svg viewBox="0 0 16 16" width={12} height={12} aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
          </button>
        ) : null}
      </div>
      <div className={C('dshwe-hintline')}><span>↩</span>{tr('hint')}</div>
      <div className={C('dshwe-tree')}>{body}</div>
      {pv}
    </div>
  )
}

// ---------- 浮层入口:面板 + 拖拽提示 + 拖放处理 ----------
function OverlayEntry(props: {
  useWorkspaces: (s: unknown) => unknown
  useSessions: (s: unknown) => unknown
}) {
  const [on, setOnState] = useState(getOpen())
  const [dragging, setDragging] = useState(false)
  useEffect(() => subscribeOpen(setOnState), [])

  useEffect(() => {
    const hasMarker = (e: DragEvent): boolean => !!e.dataTransfer && Array.from(e.dataTransfer.types ?? []).includes(MARKER)
    const onDragOver = (e: DragEvent): void => { if (!hasMarker(e)) return; e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy' }
    const onDrop = (e: DragEvent): void => {
      if (!hasMarker(e)) return
      const markerText = e.dataTransfer?.getData('text/plain') ?? ''
      const target = e.target instanceof HTMLElement ? e.target : null
      const ta = target ? target.closest('[data-composer-card] textarea') : null
      if (ta != null) { setDragging(false); return }
      e.preventDefault(); e.stopPropagation(); setDragging(false)
      if (markerText !== '') { const b = getBridge(); if (b) b.insert(markerText) }
    }
    const onDragEnd = (): void => setDragging(false)
    document.addEventListener('dragover', onDragOver, true)
    document.addEventListener('drop', onDrop, true)
    document.addEventListener('dragend', onDragEnd)
    return () => {
      document.removeEventListener('dragover', onDragOver, true)
      document.removeEventListener('drop', onDrop, true)
      document.removeEventListener('dragend', onDragEnd)
    }
  }, [])

  return (
    <div className={C('dshwe-layer')}>
      {dragging ? (
        <div className={C('dshwe-hint')}>
          <div className={C('dshwe-hint-chip')}>
            <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true"><path d="M8 3.5v6M5.7 7.2L8 9.5l2.3-2.3M3.5 12.5h9" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
            {tr('drop.hint')}
          </div>
        </div>
      ) : null}
      {on ? <Panel {...props} onDraggingChange={setDragging} /> : null}
    </div>
  )
}

// ---------- i18n / 入口 ----------
let tr = (k: string, vars?: Record<string, string | number>): string => {
  let s = DICTS.zh[k] ?? k
  if (vars) for (const key in vars) s = s.split(`{${key}}`).join(String(vars[key]))
  return s
}

interface SlotsLike {
  inject(name: string, fn: () => unknown): void
  register(options: { name: string; id: string }, component: (props: never) => React.ReactNode): unknown
}
interface CtxLike {
  get(name: string): unknown
  effect(fn: () => () => void): void
}

export const inject = ['slots', 'locale']

export function apply(ctx: CtxLike): void {
  const slots = ctx.get('slots') as SlotsLike | undefined
  if (slots === undefined) return
  const locale = ctx.get('locale') as LocaleLike | undefined
  if (locale !== undefined) {
    try {
      ctx.effect(() => {
        const d1 = locale.register(NS, 'zh', DICTS.zh)
        const d2 = locale.register(NS, 'en', DICTS.en)
        return () => { d1(); d2() }
      })
      const t = locale.bind(NS)
      tr = (k: string, vars?: Record<string, string | number>): string => {
        let s = t(k)
        if (typeof s !== 'string' || s === k) s = DICTS.zh[k] ?? k
        if (vars) for (const key in vars) s = s.split(`{${key}}`).join(String(vars[key]))
        return s
      }
    } catch (err) {
      console.warn('locale init failed, fallback zh', String(err))
    }
  }

  slots.inject('sidebar.footer.action', () => slots.register(
    { name: 'sidebar.footer.action', id: 'workspace-explorer' },
    (props: never) => <SidebarAction {...(props as { wide?: boolean })} />,
  ))
  slots.inject('shell.overlay', () => slots.register(
    { name: 'shell.overlay', id: 'workspace-explorer-panel' },
    (props: never) => <OverlayEntry {...(props as { useWorkspaces: (s: unknown) => unknown; useSessions: (s: unknown) => unknown })} />,
  ))
  slots.inject('conversation.input.dock', () => slots.register(
    { name: 'conversation.input.dock', id: 'workspace-explorer-bridge' },
    (props: never) => <DockBridge {...(props as { useInput?: (s: unknown) => unknown; inputActions?: { setDraft(d: string): void } })} />,
  ))
}
