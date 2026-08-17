/**
 * dsh-workspace-explorer — Client 半区(原生包 v0.3)
 *
 * 交互对标 dsh-better-sidebar:面板顶部 Tab 栏(文件 / 设置)切换页面;
 * 设置页逐项开关/下拉实时生效;并注册 DSH 设置壳的 settings.section 页。
 * 通过 /dsh-we/api/* JSON 路由调用 Host(list / peek / config)。
 * 浏览器 bundle(src/client/index.tsx → lib/client.js,__ModuleLoader__ 格式)。
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

// ---------- 国际化(跟随 DSH 界面语言) ----------
const NS = 'dsh-workspace-explorer'
const DICTS: Record<string, Record<string, string>> = {
  zh: {
    'panel.title': '工作区文件', 'ws.current': '当前目录', 'search.ph': '搜索文件(仅已加载目录)…',
    hint: '点击文件或拖拽到输入框,发送给模型', 'empty.title': '还没有可浏览的工作区。选择一个项目文件夹,即可在这里查看目录文件。',
    'empty.add': '+ 选择文件夹作为工作区', 'loading.ws': '正在加载工作区…', hit: '匹配 {n} 项',
    'hit.none': '没有匹配「{q}」的文件(搜索范围:已加载目录)', truncated: '已截断,仅显示前 {n} 项',
    loading: '加载中…', 'load.fail': '加载失败: ', read: '读取中…', 'read.fail': '读取失败: ',
    'too.large': '文件过大({s}),仅支持插入引用', binary: '二进制文件,仅支持插入引用',
    'lines.tail': '…(共 {n} 行,仅显示前 {m} 行)', 'btn.ref': '插入引用', 'btn.content': '插入内容',
    'btn.content.tip': '把文件内容插入输入框', 'btn.content.no': '文件过大或二进制,无法内联',
    'sidebar.tooltip': '工作区文件', 'sidebar.label': '文件', refresh: '刷新', close: '关闭',
    'close.preview': '关闭预览', 'row.tip': '点击或拖拽到输入框', 'preview.tip': '预览 (P)',
    'insert.tip': '插入引用', 'drop.hint': '松开以插入文件引用到输入框', 'add.ws': '添加工作区',
    'tab.files': '文件', 'tab.settings': '设置',
    'settings.title': '面板设置', 'settings.general': '通用',
    'settings.hideNoise': '隐藏噪声目录', 'settings.hideNoise.desc': '.git · node_modules · dist 等',
    'settings.showSize': '显示文件大小',
    'settings.refStyle': '文件引用格式', 'settings.refStyle.rel': '相对路径', 'settings.refStyle.abs': '绝对路径',
    'settings.peekLines': '预览行数',
    'settings.width': '面板宽度', 'settings.width.narrow': '紧凑', 'settings.width.std': '标准', 'settings.width.wide': '宽松',
    'settings.restore': '恢复默认', 'settings.note': '配置在本次会话内生效,重启插件后恢复默认。',
    'settings.nav': '工作区文件',
    'resize.tip': '拖动调整宽度',
    'drawer.tip': '文件目录', 'drawer.open': '打开文件抽屉', 
  },
  en: {
    'panel.title': 'Workspace Files', 'ws.current': 'Current dir', 'search.ph': 'Search files (loaded dirs only)…',
    hint: 'Click a file or drag it into the composer to send', 'empty.title': 'No browsable workspace yet. Pick a project folder to view its files.',
    'empty.add': '+ Choose a folder as workspace', 'loading.ws': 'Loading workspaces…', hit: '{n} match(es)',
    'hit.none': 'No files match "{q}" (search covers loaded dirs)', truncated: 'Truncated: showing the first {n}',
    loading: 'Loading…', 'load.fail': 'Load failed: ', read: 'Reading…', 'read.fail': 'Read failed: ',
    'too.large': 'File too large ({s}); reference only', binary: 'Binary file; reference only',
    'lines.tail': '…({n} lines total, showing the first {m})', 'btn.ref': 'Insert reference', 'btn.content': 'Insert content',
    'btn.content.tip': 'Insert the file content into the composer', 'btn.content.no': 'Too large or binary — cannot inline',
    'sidebar.tooltip': 'Workspace Files', 'sidebar.label': 'Files', refresh: 'Refresh', close: 'Close',
    'close.preview': 'Close preview', 'row.tip': 'click or drag to the composer', 'preview.tip': 'Preview (P)',
    'insert.tip': 'Insert reference', 'drop.hint': 'Release to insert the file reference into the composer', 'add.ws': 'Add workspace',
    'tab.files': 'Files', 'tab.settings': 'Settings',
    'settings.title': 'Panel settings', 'settings.general': 'General',
    'settings.hideNoise': 'Hide noise dirs', 'settings.hideNoise.desc': '.git · node_modules · dist …',
    'settings.showSize': 'Show file sizes',
    'settings.refStyle': 'File reference format', 'settings.refStyle.rel': 'Relative path', 'settings.refStyle.abs': 'Absolute path',
    'settings.peekLines': 'Preview lines',
    'settings.width': 'Panel width', 'settings.width.narrow': 'Narrow', 'settings.width.std': 'Standard', 'settings.width.wide': 'Wide',
    'settings.restore': 'Reset to defaults', 'settings.note': 'Settings apply for this run; they reset when the plugin restarts.',
    'settings.nav': 'Workspace Explorer',
    'resize.tip': 'Drag to resize',
    'drawer.tip': 'Files', 'drawer.open': 'Open files drawer', 
  },
}

interface LocaleLike {
  register(ns: string, locale: string, dict: Record<string, string>): () => void
  bind(ns: string): (key: string) => string
}

// ---------- 图标 ----------
const FOLDER_D = 'M1.5 2.5A1.5 1.5 0 0 1 3 1h3.2l1.6 2H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5v-9z'
// 文件树图标:顶部文件夹 + 向下的树状分支线(16x16)
const FOLDER_TREE_D = 'M2.5 3.6A1.6 1.6 0 0 1 4.1 2h1.9l1 1.5h5.4A1.6 1.6 0 0 1 14 5.1v3.3H2.5z'
const TREE_LINE_D = 'M4.5 8.4v5.4M4.5 9.8h3.2M6.2 9.8v1.6M4.5 11.8h5M7.4 11.8v1.6'
// Harness 原生 hHd-Xa_panelIcon 对应的 IconPanelLeftOutline16 path
const DOC_BODY = 'M4.3 1.7h5.3l2.7 2.7v8.9a1 1 0 0 1-1 1H4.3a1 1 0 0 1-1-1V2.7a1 1 0 0 1 1-1z'
const DOC_FOLD = 'M9.6 1.7L12.3 4.4H9.6z'
const GEAR_D = 'M8 9.9a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zM8 4.3V2.9M8 13.1v-1.4M4.3 8H2.9M13.1 8h-1.4M5.2 5.2L4.1 4.1M11.9 11.9l-1.1-1.1M5.2 10.8L4.1 11.9M11.9 4.1l-1.1 1.1'
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
interface ConfigResult { ok: boolean; ignore?: string[]; max?: number; peekMaxLines?: number }

// ---------- 运行期配置(内存级;面板设置 Tab 与 DSH 设置页共享) ----------
const NOISE = ['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.pytest_cache', '.ruff_cache', '.mypy_cache', 'dist', 'build', '.next', '.nuxt', 'coverage', '.idea', 'target']
interface WsCfg {
  hideNoise: boolean
  showSize: boolean
  refStyle: 'relative' | 'absolute'
  peekLines: number
  width: number
}
const CFG_DEFAULTS: WsCfg = { hideNoise: true, showSize: true, refStyle: 'relative', peekLines: 60, width: 384 }
let cfg: WsCfg = { ...CFG_DEFAULTS }
const cfgListeners = new Set<(c: WsCfg) => void>()
const getCfg = (): WsCfg => cfg
const notifyCfg = (): void => { cfgListeners.forEach((fn) => fn(cfg)) }
const syncHostCfg = (): void => {
  void api<ConfigResult>('config', { ignore: cfg.hideNoise ? NOISE.slice() : [], peekMaxLines: cfg.peekLines }).catch(() => {})
}
const setCfg = (patch: Partial<WsCfg>): void => { cfg = { ...cfg, ...patch }; notifyCfg(); syncHostCfg() }
const resetCfg = (): void => { cfg = { ...CFG_DEFAULTS }; notifyCfg(); syncHostCfg() }
const subscribeCfg = (fn: (c: WsCfg) => void): (() => void) => { cfgListeners.add(fn); return () => { cfgListeners.delete(fn) } }
syncHostCfg()

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
function TabFolderSvg() {
  return <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true"><path d={FOLDER_D} fill="currentColor" /></svg>
}
function GearSvg() {
  return <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true"><path d={GEAR_D} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" /></svg>
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
// 打开/关闭右侧文件弹窗(纯 UI 状态,不驱动壳的 details 列)
const toggleDrawer = (): void => { setOpen(!getOpen()) }
// 关闭弹窗
const closeDrawer = (): void => { setOpen(false) }

// 动态测量弹窗区域:顶部 = 会话 header 底部,底部 = 输入框(composer)顶部
// 即"对话框上方、顶部下方"这段区域,窗口/header/composer 变化时实时更新
const measurePopup = (): { top: number; height: number } => {
  const vh = window.innerHeight
  const header = document.querySelector('[data-slot="conversation.session.header"]')
  const composer = document.querySelector('[data-composer-card]')
  const top = header ? Math.round(header.getBoundingClientRect().bottom) + 8 : 48
  const bottomLimit = composer ? Math.round(composer.getBoundingClientRect().top) - 8 : vh - 48
  return { top, height: Math.max(200, bottomLimit - top) }
}

let bridge: { insert(text: string): void } | null = null
const setBridge = (b: { insert(text: string): void } | null): void => { bridge = b }
const getBridge = () => bridge

// ---------- 会话头部工具区按钮(与 session log 同排) ----------
function HeaderAction() {
  return (
    <button type="button" className={C('dshwe-hicon')}
      onClick={toggleDrawer} title={tr('drawer.open')} aria-label={tr('drawer.open')}>
      <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
        <path d={FOLDER_TREE_D} fill="currentColor" />
        <path d={TREE_LINE_D} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
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

// ---------- 设置控件 ----------
function SwitchRow(props: { label: string; caption?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={C('dshwe-setrow')}>
      <div className={C('dshwe-setinfo')}>
        <div className={C('dshwe-setlabel')}>{props.label}</div>
        {props.caption ? <div className={C('dshwe-setcap')}>{props.caption}</div> : null}
      </div>
      <button type="button" role="switch" aria-checked={props.checked} className={C('dshwe-switch')}
        onClick={() => props.onChange(!props.checked)} aria-label={props.label} />
    </div>
  )
}
function SelectRow(props: { label: string; caption?: string; value: string; options: Array<{ value: string; label: string }>; onChange: (v: string) => void }) {
  return (
    <div className={C('dshwe-setrow')}>
      <div className={C('dshwe-setinfo')}>
        <div className={C('dshwe-setlabel')}>{props.label}</div>
        {props.caption ? <div className={C('dshwe-setcap')}>{props.caption}</div> : null}
      </div>
      <select className={C('dshwe-setselect')} value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        {props.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
function SettingsView() {
  const [c, setC] = useState(getCfg())
  useEffect(() => subscribeCfg(setC), [])
  const widthOpts = [
    { value: '320', label: `${tr('settings.width.narrow')} · 320` },
    { value: '384', label: `${tr('settings.width.std')} · 384` },
    { value: '480', label: `${tr('settings.width.wide')} · 480` },
  ]
  const refOpts = [
    { value: 'relative', label: tr('settings.refStyle.rel') },
    { value: 'absolute', label: tr('settings.refStyle.abs') },
  ]
  const lineOpts = [
    { value: '30', label: '30' },
    { value: '60', label: '60' },
    { value: '120', label: '120' },
  ]
  return (
    <div className={C('dshwe-set')}>
      <div className={C('dshwe-setsec')}>{tr('settings.general')}</div>
      <SwitchRow label={tr('settings.hideNoise')} caption={tr('settings.hideNoise.desc')} checked={c.hideNoise} onChange={(v) => setCfg({ hideNoise: v })} />
      <SwitchRow label={tr('settings.showSize')} checked={c.showSize} onChange={(v) => setCfg({ showSize: v })} />
      <SelectRow label={tr('settings.refStyle')} value={c.refStyle} options={refOpts} onChange={(v) => setCfg({ refStyle: v as 'relative' | 'absolute' })} />
      <SelectRow label={tr('settings.peekLines')} value={String(c.peekLines)} options={lineOpts} onChange={(v) => setCfg({ peekLines: Number(v) })} />
      <SelectRow label={tr('settings.width')} value={String(c.width)} options={widthOpts} onChange={(v) => setCfg({ width: Number(v) })} />
      <div className={C('dshwe-setfoot')}>
        <button type="button" className={C('dshwe-prevbtn')} onClick={resetCfg}>{tr('settings.restore')}</button>
      </div>
      <div className={C('dshwe-setnote')}>{tr('settings.note')}</div>
    </div>
  )
}

// ---------- 右侧面板(顶部 Tab:文件 / 设置) ----------
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
  const [tab, setTab] = useState<'files' | 'settings'>('files')
  const [c, setC] = useState(getCfg())
  useEffect(() => subscribeCfg(setC), [])

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

  // 噪声目录开关变化时,重新加载已展开的目录
  useEffect(() => {
    if (root === null) return
    void loadDir(root, '')
    Object.keys(expanded).forEach((rel) => { if (rel !== '') void loadDir(root, rel) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.hideNoise])

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
  const markerFor = (entry: WsEntry): string => (c.refStyle === 'relative' && root === cwd) ? `[file: ${entry.rel}]` : `[file: ${entry.path}]`
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

  const addWorkspace = async (): Promise<void> => {
    // 原生版暂不开放"选择文件夹注册工作区"(依赖 workspaces 服务,后续版本补充)
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
        {!isDir && c.showSize && entry.size != null ? <span className={C('dshwe-size')}>{fmtSize(entry.size)}</span> : null}
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
    else contentArea = <pre className={C('dshwe-preview-pre')}>{d?.content}{d?.truncatedLines ? `\n${tr('lines.tail', { n: d.lineCount ?? 0, m: c.peekLines })}` : ''}</pre>
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

  const filesBody = (
    <>
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
    </>
  )

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
        <button type="button" className={C('dshwe-icobtn')} onClick={closeDrawer} title={tr('close')} aria-label={tr('close')}>
          <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className={C('dshwe-tabs')} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'files'}
          className={C('dshwe-tab') + (tab === 'files' ? ` ${C('dshwe-tab-on')}` : '')}
          onClick={() => setTab('files')}>
          <TabFolderSvg /><span>{tr('tab.files')}</span><span className={C('dshwe-tab-ind')} />
        </button>
        <button type="button" role="tab" aria-selected={tab === 'settings'}
          className={C('dshwe-tab') + (tab === 'settings' ? ` ${C('dshwe-tab-on')}` : '')}
          onClick={() => setTab('settings')}>
          <GearSvg /><span>{tr('tab.settings')}</span><span className={C('dshwe-tab-ind')} />
        </button>
      </div>
      {tab === 'files' ? filesBody : <div className={C('dshwe-tabbody')}><SettingsView /></div>}
    </div>
  )
}

// ---------- 弹窗根:浮动面板,位于顶部 header 与输入框之间,带展开/收起动画 ----------
function DrawerRoot(props: {
  useWorkspaces: (s: unknown) => unknown
  useSessions: (s: unknown) => unknown
}) {
  const [on, setOn] = useState(getOpen())
  const [shown, setShown] = useState(false)
  const [rect, setRect] = useState({ top: 48, height: 480 })
  const [dragging, setDragging] = useState(false)
  useEffect(() => subscribeOpen(setOn), [])
  // 打开时先挂载再置 shown,触发 CSS 过渡动画
  useEffect(() => {
    if (on) {
      setShown(false)
      const raf = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(raf)
    }
    setShown(false)
  }, [on])
  // 动态测量弹窗区域:header 底部 → composer 顶部;窗口尺寸/布局变化时实时更新
  useEffect(() => {
    const update = (): void => setRect(measurePopup())
    update()
    const ro = new ResizeObserver(update)
    const header = document.querySelector('[data-slot="conversation.session.header"]')
    const composer = document.querySelector('[data-composer-card]')
    if (header) ro.observe(header)
    if (composer) ro.observe(composer)
    window.addEventListener('resize', update)
    return () => { ro.disconnect(); window.removeEventListener('resize', update) }
  }, [])
  useEffect(() => {
    const hasMarker = (e: DragEvent): boolean => !!e.dataTransfer && Array.from(e.dataTransfer.types ?? []).includes(MARKER)
    const onDragOver = (e: DragEvent): void => { if (!hasMarker(e)) return; e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy' }
    const onDrop = (e: DragEvent): void => {
      if (!hasMarker(e)) return
      const markerText = e.dataTransfer?.getData('text/plain') ?? ''
      const target = e.target instanceof HTMLElement ? e.target : null
      if (target?.closest('[data-composer-card] textarea')) { setDragging(false); return }
      e.preventDefault(); e.stopPropagation(); setDragging(false)
      if (markerText !== '') getBridge()?.insert(markerText)
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
      {dragging ? <div className={C('dshwe-hint')}><div className={C('dshwe-hint-chip')}><svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true"><path d="M8 3.5v6M5.7 7.2L8 9.5l2.3-2.3M3.5 12.5h9" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>{tr('drop.hint')}</div></div> : null}
      {on ? <div className={C('dshwe-popup') + (shown ? ` ${C('dshwe-popup-on')}` : '')} style={{ top: rect.top, height: rect.height }}><Panel {...props} onDraggingChange={setDragging} /></div> : null}
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
  register(options: { name: string; id: string; order?: number; label?: string | (() => string) }, component: (props: never) => React.ReactNode): unknown
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

  slots.inject('conversation.session.header.utilities', () => slots.register(
    { name: 'conversation.session.header.utilities', id: 'workspace-explorer-drawer', order: 20, label: () => tr('drawer.tip') },
    () => <HeaderAction />,
  ))
  // 占位注册:顶掉旧版原生包在侧边栏底部的「文件」按钮(用户要求仅保留会话头部入口)
  slots.inject('sidebar.footer.action', () => slots.register(
    { name: 'sidebar.footer.action', id: 'workspace-explorer' },
    () => null,
  ))
  slots.inject('shell.overlay', () => slots.register(
    { name: 'shell.overlay', id: 'workspace-explorer-panel' },
    (props: never) => <DrawerRoot {...(props as { useWorkspaces: (s: unknown) => unknown; useSessions: (s: unknown) => unknown })} />,
  ))
  slots.inject('conversation.input.dock', () => slots.register(
    { name: 'conversation.input.dock', id: 'workspace-explorer-bridge' },
    (props: never) => <DockBridge {...(props as { useInput?: (s: unknown) => unknown; inputActions?: { setDraft(d: string): void } })} />,
  ))
  slots.inject('settings.section', () => slots.register(
    { name: 'settings.section', id: 'workspace-explorer', order: 30, label: () => tr('settings.nav') },
    () => <div className={C('dshwe-setpage')}><SettingsView /></div>,
  ))
}
