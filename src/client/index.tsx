/**
 * dsh-workspace-explorer — Client 半区(原生包 v0.3)
 *
 * 交互对标 dsh-better-sidebar:面板顶部 Tab 栏(文件 / 设置)切换页面;
 * 设置页逐项开关/下拉实时生效;并注册 DSH 设置壳的 settings.section 页。
 * 通过 /dsh-we/api/* JSON 路由调用 Host(list / peek / config)。
 * 浏览器 bundle(src/client/index.tsx → lib/client.js,__ModuleLoader__ 格式)。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import styles from './panel.module.css'
import { basename, extOf, fmtSize, formatTreeBlock } from './format'

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
    hint: '点击/拖拽插入;Shift 或 ⌘ 点击可多选批量插入', 'empty.title': '还没有可浏览的工作区。选择一个项目文件夹,即可在这里查看目录文件。',
    'empty.add': '+ 选择文件夹作为工作区', 'loading.ws': '正在加载工作区…', hit: '匹配 {n} 项',
    'hit.none': '没有匹配「{q}」的文件(搜索范围:已加载目录)', truncated: '已截断,仅显示前 {n} 项',
    loading: '加载中…', 'load.fail': '加载失败: ', read: '读取中…', 'read.fail': '读取失败: ',
    'too.large': '文件过大({s}),仅支持插入引用', binary: '二进制文件,仅支持插入引用',
    'btn.ref': '插入引用', 'btn.content': '插入内容',
    'btn.content.tip': '把文件内容插入输入框', 'btn.content.no': '文件过大或二进制,无法内联',
    'sidebar.tooltip': '工作区文件', 'sidebar.label': '文件', refresh: '刷新', close: '关闭',
    'close.preview': '关闭预览', 'row.tip': '点击或拖拽到输入框', 'preview.tip': '预览 (P)',
    'insert.tip': '插入引用', 'drop.hint': '松开以插入文件引用到输入框', 'drop.hint.dir': '松开以插入目录树',
    'add.ws': '添加工作区', 'dir.tree.fail': '目录树生成失败: ',
    'sel.count': '已选 {n} 项', 'sel.insert': '插入所选', 'sel.clear': '清除',
    'preview.page': '第 {n} 页', 'preview.lines': '{n} 行', 'preview.prev': '上一页', 'preview.next': '下一页',
    'edit': '编辑', 'edit.save': '保存', 'edit.discard': '放弃', 'edit.cancel': '取消',
    'edit.dirty': '已修改', 'edit.saving': '保存中…', 'edit.save.fail': '保存失败: ',
    'edit.save.ok': '已保存', 'edit.confirm.discard': '放弃修改？', 'edit.readonly': '只读文件',
    'edit.preview.tip': '预览 / 编辑 (P)',
    'tab.files': '文件', 'tab.settings': '设置',
    'settings.title': '面板设置', 'settings.general': '通用',
    'settings.hideNoise': '隐藏噪声目录', 'settings.hideNoise.desc': '.git · node_modules · dist 等',
    'settings.showSize': '显示文件大小',
    'settings.refStyle': '文件引用格式', 'settings.refStyle.rel': '相对路径', 'settings.refStyle.abs': '绝对路径',
    'settings.peekLines': '预览行数',
    'settings.width': '面板宽度', 'settings.width.narrow': '紧凑', 'settings.width.std': '标准', 'settings.width.wide': '宽松',
    'settings.restore': '恢复默认', 'settings.note': '配置在本次会话内生效,重启插件后恢复默认。',
    'settings.nav': '工作区文件',
    'star.ask': '⭐ 顺手留颗 Star，作者能高兴一整天',
    'star.cta': '★ 给一颗 Star',
    'drawer.tip': '文件目录', 'drawer.open': '打开文件抽屉', 'drawer.label': '工作区文件',
  },
  en: {
    'panel.title': 'Workspace Files', 'ws.current': 'Current dir', 'search.ph': 'Search files (loaded dirs only)…',
    hint: 'Click / drag to insert; Shift or ⌘ click to select multiple', 'empty.title': 'No browsable workspace yet. Pick a project folder to view its files.',
    'empty.add': '+ Choose a folder as workspace', 'loading.ws': 'Loading workspaces…', hit: '{n} match(es)',
    'hit.none': 'No files match "{q}" (search covers loaded dirs)', truncated: 'Truncated: showing the first {n}',
    loading: 'Loading…', 'load.fail': 'Load failed: ', read: 'Reading…', 'read.fail': 'Read failed: ',
    'too.large': 'File too large ({s}); reference only', binary: 'Binary file; reference only',
    'btn.ref': 'Insert reference', 'btn.content': 'Insert content',
    'btn.content.tip': 'Insert the file content into the composer', 'btn.content.no': 'Too large or binary — cannot inline',
    'sidebar.tooltip': 'Workspace Files', 'sidebar.label': 'Files', refresh: 'Refresh', close: 'Close',
    'close.preview': 'Close preview', 'row.tip': 'click or drag to the composer', 'preview.tip': 'Preview (P)',
    'insert.tip': 'Insert reference', 'drop.hint': 'Release to insert the file reference into the composer', 'drop.hint.dir': 'Release to insert the folder tree',
    'add.ws': 'Add workspace', 'dir.tree.fail': 'Folder tree failed: ',
    'sel.count': '{n} selected', 'sel.insert': 'Insert', 'sel.clear': 'Clear',
    'preview.page': 'Page {n}', 'preview.lines': '{n} lines', 'preview.prev': 'Previous page', 'preview.next': 'Next page',
    'edit': 'Edit', 'edit.save': 'Save', 'edit.discard': 'Discard', 'edit.cancel': 'Cancel',
    'edit.dirty': 'Modified', 'edit.saving': 'Saving…', 'edit.save.fail': 'Save failed: ',
    'edit.save.ok': 'Saved', 'edit.confirm.discard': 'Discard changes?', 'edit.readonly': 'Read-only',
    'edit.preview.tip': 'Preview / Edit (P)',
    'tab.files': 'Files', 'tab.settings': 'Settings',
    'settings.title': 'Panel settings', 'settings.general': 'General',
    'settings.hideNoise': 'Hide noise dirs', 'settings.hideNoise.desc': '.git · node_modules · dist …',
    'settings.showSize': 'Show file sizes',
    'settings.refStyle': 'File reference format', 'settings.refStyle.rel': 'Relative path', 'settings.refStyle.abs': 'Absolute path',
    'settings.peekLines': 'Preview lines',
    'settings.width': 'Panel width', 'settings.width.narrow': 'Narrow', 'settings.width.std': 'Standard', 'settings.width.wide': 'Wide',
    'settings.restore': 'Reset to defaults', 'settings.note': 'Settings apply for this run; they reset when the plugin restarts.',
    'settings.nav': 'Workspace Explorer',
    'star.ask': '⭐ Drop a Star if it helped — it makes the author\'s day',
    'star.cta': '★ Give a Star',
    'drawer.tip': 'Files', 'drawer.open': 'Open files drawer', 'drawer.label': 'Workspace Files',
  },
}

interface LocaleLike {
  register(ns: string, locale: string, dict: Record<string, string>): () => void
  bind(ns: string): (key: string) => string
}

/** workspaces 服务(与动态版一致:pickDirectory 弹出目录选择,create 注册新工作区)。 */
interface WorkspacesSvcLike {
  pickDirectory(): Promise<string | null>
  create(p: { path: string }): Promise<{ path: string }>
}
let workspacesSvc: WorkspacesSvcLike | null = null

// ---------- 图标 ----------
const FOLDER_D = 'M1.5 2.5A1.5 1.5 0 0 1 3 1h3.2l1.6 2H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5v-9z'
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
  ok: boolean; error?: string; binary?: boolean; size?: number
  lineCount?: number | null; startLine?: number; content?: string; hasMore?: boolean
}
interface TreeResult { ok: boolean; error?: string; name?: string; entries?: WsEntry[]; entryCount?: number; truncated?: boolean }
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

// ---------- 目录树文本(目录拖拽 / 多选批量插入共用) ----------
async function fetchTreeText(root: string, rel: string, depth = 3): Promise<string | null> {
  try {
    const res = await api<TreeResult>('tree', { root, rel, depth })
    if (!res.ok || !res.entries) { console.warn('ws-tree.tree failed', res.error); return null }
    return formatTreeBlock(res.name ?? basename(root), res.entries, res.truncated === true)
  } catch (err) {
    console.warn('ws-tree.tree failed', String((err as Error)?.message ?? err))
    return null
  }
}

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

// ---------- 输入桥接口:追加 @引用 文本 ----------
interface WsBridge {
  /** 追加文本到输入框(setDraft) */
  insert(text: string): void
}
let bridge: WsBridge | null = null
const setBridge = (b: WsBridge | null): void => { bridge = b }
const getBridge = () => bridge

// ---------- @ 触发源:工作区文件搜索 ----------
interface FlatFile { rel: string; name: string; type: 'directory' | 'file'; path: string }

/** 当前工作区根目录(Panel 打开/切换时同步;也可由 apply() 通过 sessions 服务自动推导) */
let activeWorkspaceRoot: string | null = null
const rootListeners = new Set<(r: string | null) => void>()
const setActiveRoot = (r: string | null): void => {
  if (r !== activeWorkspaceRoot) {
    activeWorkspaceRoot = r
    rootListeners.forEach((fn) => fn(r))
    if (r !== null) invalidateFileCache() // 根目录变化时清除文件缓存
  }
}

/** 从 sessions 服务自动推导工作区根目录(面板未打开时的 fallback) */
let sessionsCwdRoot: string | null = null
/** 当前会话的 cwd(用于 @ 引用格式化:判断是否可用相对路径) */
let activeCwd: string | null = null
function getEffectiveRoot(): string | null {
  return activeWorkspaceRoot ?? sessionsCwdRoot
}

/** 文件列表缓存:root → files */
let fileCacheRoot: string | null = null
let fileCache: FlatFile[] = []
let fileCachePromise: Promise<FlatFile[]> | null = null

async function fetchAllFiles(root: string): Promise<FlatFile[]> {
  if (fileCacheRoot === root && fileCache.length > 0) return fileCache
  if (fileCachePromise) return fileCachePromise
  fileCachePromise = (async () => {
    try {
      // 增加深度和条目数限制，以支持更深层级的目录搜索
      const res = await api<TreeResult>('tree', { root, rel: '', depth: 10, maxEntries: 5000 })
      if (!res.ok || !res.entries) return []
      const files: FlatFile[] = res.entries.map((e) => ({
        rel: e.rel, name: e.name, type: e.type,
        path: root.replace(/\/+$/, '') + '/' + e.rel,
      }))
      fileCacheRoot = root
      fileCache = files
      return files
    } catch {
      return []
    } finally {
      fileCachePromise = null
    }
  })()
  return fileCachePromise
}

function invalidateFileCache(): void { fileCacheRoot = null; fileCache = [] }

// ---------- 会话头部工具区按钮(与 session log 同排:功能名称 + 图标胶囊) ----------
function HeaderAction() {
  const [on, setOn] = useState(getOpen())
  useEffect(() => subscribeOpen(setOn), [])
  return (
    <button type="button" className={C('dshwe-hicon') + (on ? ` ${C('dshwe-hicon-on')}` : '')}
      onClick={toggleDrawer} title={tr('drawer.tip')} aria-label={tr('drawer.open')}>
      <span>{tr('drawer.label')}</span>
      <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true">
        <path d={FOLDER_D} fill="currentColor" />
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
      <div className={C('dshwe-star-section')}>
        <div className={C('dshwe-star-row')}>
          <div className={C('dshwe-star-info')}>
            <div className={C('dshwe-star-label')}>{tr('star.ask')}</div>
          </div>
          <a className={C('dshwe-star-link')}
            href="https://github.com/Jiyr0119/dsh-workspace-explorer"
            target="_blank" rel="noreferrer">
            {tr('star.cta')}
          </a>
        </div>
      </div>
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
  onDraggingChange: (v: 'file' | 'dir' | null) => void
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
  const [preview, setPreview] = useState<{ entry: WsEntry; loading: boolean; data: PeekResult | null; error: string | null; page: number; mode: 'preview' | 'edit'; editContent: string; dirty: boolean; saving: boolean; saveError: string | null } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selAnchor, setSelAnchor] = useState<string | null>(null)
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

  // 当前 root 已不在可用工作区/当前目录里(会话 cwd 变化等)时,跟随回退,避免下拉框空白
  const knownRoots = new Set<string>()
  if (cwd) knownRoots.add(cwd)
  for (const w of workspaces) knownRoots.add(w.path)
  useEffect(() => {
    if (root === null || knownRoots.has(root)) return
    setRoot(cwd ?? workspaces[0]?.path ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, cwd, wsState.items])

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
    setDirs({}); setExpanded({}); setPreview(null); setSelected(new Set()); setSelAnchor(null)
    void loadDir(root, '')
    // 同步工作区根目录给 @ 触发源
    setActiveRoot(root)
    return () => setActiveRoot(null)
  }, [root, loadDir])

  // 噪声目录开关变化时,重新加载已展开的目录 + 清除 @ 触发源的文件缓存
  useEffect(() => {
    if (root === null) return
    void loadDir(root, '')
    Object.keys(expanded).forEach((rel) => { if (rel !== '') void loadDir(root, rel) })
    invalidateFileCache()
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
  const refPath = (entry: WsEntry): string => (c.refStyle === 'relative' && root === cwd) ? entry.rel : entry.path
  /** 生成 @引用 文本:目录带 / 后缀,文件带扩展名 */
  const refAt = (entry: WsEntry): string => entry.type === 'directory' ? `@${refPath(entry)}/` : `@${refPath(entry)}`
  const insertMarker = (entry: WsEntry): void => { getBridge()?.insert(refAt(entry)) }

  // 统一的 @引用格式化:供 @ 触发源和面板共用
  // file.rel = 相对路径, file.path = 绝对路径, file.type = 'directory' | 'file'
  const formatAtRef = (rel: string, absPath: string, type: 'directory' | 'file'): string => {
    const useRel = c.refStyle === 'relative' && root === cwd
    const p = useRel ? rel : absPath
    return type === 'directory' ? `@${p}/` : `@${p}`
  }

  // 分页预览:按行加载第 page 页(每页 c.peekLines 行)
  const loadPreviewPage = useCallback(async (entry: WsEntry, page: number, keepMode = false): Promise<void> => {
    setPreview((prev) => ({
      entry, loading: true, data: null, error: null, page,
      mode: keepMode && prev?.entry.rel === entry.rel ? prev.mode : 'preview',
      editContent: keepMode && prev?.entry.rel === entry.rel ? prev.editContent : '',
      dirty: keepMode && prev?.entry.rel === entry.rel ? prev.dirty : false,
      saving: false, saveError: null,
    }))
    try {
      const res = await api<PeekResult>('peek', { root: root ?? '', rel: entry.rel, offset: page * c.peekLines, limit: c.peekLines })
      if (!res.ok) throw new Error(res.error ?? 'unknown')
      setPreview((prev) => ({
        entry, loading: false, data: res, error: null, page,
        mode: prev?.entry.rel === entry.rel ? prev.mode : 'preview',
        editContent: prev?.entry.rel === entry.rel ? prev.editContent : '',
        dirty: prev?.entry.rel === entry.rel ? prev.dirty : false,
        saving: false, saveError: null,
      }))
    } catch (err) {
      setPreview((prev) => ({
        entry, loading: false, data: null, error: String((err as Error)?.message ?? err), page,
        mode: prev?.entry.rel === entry.rel ? prev.mode : 'preview',
        editContent: prev?.entry.rel === entry.rel ? prev.editContent : '',
        dirty: prev?.entry.rel === entry.rel ? prev.dirty : false,
        saving: false, saveError: null,
      }))
    }
  }, [root, c.peekLines])
  const openPreview = (entry: WsEntry): void => { void loadPreviewPage(entry, 0) }
  const previewPrev = (): void => { if (preview && preview.page > 0 && !preview.loading) void loadPreviewPage(preview.entry, preview.page - 1) }
  const previewNext = (): void => { if (preview && preview.data?.hasMore && !preview.loading) void loadPreviewPage(preview.entry, preview.page + 1) }
  // 「插入内容」:小文件(≤32KB)整文件取回
  const insertContent = async (): Promise<void> => {
    if (!preview || preview.loading || preview.error || !preview.data || root === null) return
    const d = preview.data
    if (d.binary || (d.size ?? 0) > 32768) return
    const res = await api<PeekResult>('peek', { root, rel: preview.entry.rel, whole: true })
    if (!res.ok || res.content == null) return
    const b = getBridge()
    if (b) b.insert(res.content)
  }

  // ---------- 编辑模式 ----------
  const enterEditMode = async (): Promise<void> => {
    if (!preview || preview.loading || preview.error || !preview.data || root === null) return
    // 加载完整文件内容用于编辑
    const d = preview.data
    let fullContent = d.content ?? ''
    if (d.binary || (d.size ?? 0) > 4 * 1024 * 1024) return // 超大文件不编辑
    if (d.lineCount != null && d.lineCount > c.peekLines) {
      // 内容不完整,加载全文
      const res = await api<PeekResult>('peek', { root, rel: preview.entry.rel, whole: true })
      if (!res.ok || res.content == null) return
      fullContent = res.content
    }
    setPreview((prev) => prev ? { ...prev, mode: 'edit', editContent: fullContent, dirty: false, saveError: null } : prev)
  }
  const updateEditContent = (content: string): void => {
    setPreview((prev) => prev ? { ...prev, editContent: content, dirty: true } : prev)
  }
  const saveFile = async (): Promise<void> => {
    if (!preview || !root || preview.mode !== 'edit') return
    setPreview((prev) => prev ? { ...prev, saving: true, saveError: null } : prev)
    try {
      const res = await api<{ ok: boolean; error?: string; size?: number }>('write', {
        root, rel: preview.entry.rel, content: preview.editContent, expectedSize: preview.entry.size,
      })
      if (!res.ok) {
        if (res.error === 'file-changed') {
          setPreview((prev) => prev ? { ...prev, saving: false, saveError: tr('edit.save.fail') + '文件已被外部修改' } : prev)
        } else {
          setPreview((prev) => prev ? { ...prev, saving: false, saveError: tr('edit.save.fail') + (res.error ?? 'unknown') } : prev)
        }
        return
      }
      // 保存成功:更新 entry.size,切回预览模式
      setPreview((prev) => prev ? {
        ...prev, saving: false, saveError: null, dirty: false, mode: 'preview',
        entry: { ...prev.entry, size: res.size ?? prev.entry.size },
      } : prev)
      // 刷新文件树(反映可能的大小变化)
      if (root) void loadDir(root, '')
    } catch (err) {
      setPreview((prev) => prev ? { ...prev, saving: false, saveError: tr('edit.save.fail') + String((err as Error)?.message ?? err) } : prev)
    }
  }
  const discardEdit = (): void => {
    if (preview?.dirty && !window.confirm(tr('edit.confirm.discard'))) return
    setPreview((prev) => prev ? { ...prev, mode: 'preview', editContent: '', dirty: false, saveError: null } : prev)
  }
  const cancelEdit = (): void => {
    setPreview((prev) => prev ? { ...prev, mode: 'preview', editContent: '', dirty: false, saveError: null } : prev)
  }

  // 拖拽:文件 → 引用标记;目录 → 目录树文本(落点处异步生成)
  const onDragStart = (ev: React.DragEvent, entry: WsEntry): void => {
    ev.dataTransfer.setData('text/plain', entry.type === 'directory' ? entry.name : refAt(entry))
    ev.dataTransfer.setData(MARKER, JSON.stringify({ root, rel: entry.rel, name: entry.name, type: entry.type }))
    ev.dataTransfer.effectAllowed = 'copy'
    props.onDraggingChange(entry.type === 'directory' ? 'dir' : 'file')
  }

  const addWorkspace = async (): Promise<void> => {
    if (!workspacesSvc) return
    try {
      const p = await workspacesSvc.pickDirectory()
      if (!p) return
      const v = await workspacesSvc.create({ path: p })
      if (v?.path) setRoot(v.path)
    } catch (err) {
      console.warn('addWorkspace failed', String((err as Error)?.message ?? err))
    }
  }

  const q = filter.trim().toLowerCase()
  // 搜索时使用 fetchAllFiles 获取所有文件（包括未展开的目录）
  const [searchFiles, setSearchFiles] = useState<FlatFile[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // 当搜索框有内容时，异步加载所有文件用于搜索
  useEffect(() => {
    if (q === '' || !root) {
      setSearchFiles([])
      return
    }
    let cancelled = false
    setSearchLoading(true)
    fetchAllFiles(root).then((files) => {
      if (!cancelled) {
        setSearchFiles(files)
        setSearchLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [q, root])

  const collectMatches = (rel: string, out: WsEntry[]): void => {
    const data = dirs[rel]
    if (!data) return
    for (const entry of data.entries) {
      if (entry.name.toLowerCase().includes(q)) out.push(entry)
      if (entry.type === 'directory') collectMatches(entry.rel, out)
    }
  }

  // 搜索所有文件（包括未展开的目录）
  const collectAllMatches = (out: WsEntry[]): void => {
    for (const f of searchFiles) {
      if (f.name.toLowerCase().includes(q) || f.rel.toLowerCase().includes(q)) {
        out.push({
          name: f.name,
          type: f.type as 'directory' | 'file',
          path: f.path,
          rel: f.rel,
          size: null,
        })
      }
    }
  }

  // 当前可见条目(平铺):搜索模式取匹配,否则按展开树顺序
  const flatVisible = (): WsEntry[] => {
    if (q !== '') {
      const hits: WsEntry[] = []
      collectAllMatches(hits)
      return hits
    }
    const out: WsEntry[] = []
    const walk = (rel: string): void => {
      const data = dirs[rel]
      if (!data) return
      for (const entry of data.entries) {
        out.push(entry)
        if (entry.type === 'directory' && expanded[entry.rel]) walk(entry.rel)
      }
    }
    walk('')
    return out
  }
  // 行点击:Shift 扩展选择区间,⌘/Ctrl 切换选择;普通点击保持原行为(目录展开 / 文件插入引用)
  const onRowClick = (ev: React.MouseEvent, entry: WsEntry): void => {
    const isDir = entry.type === 'directory'
    if (ev.shiftKey || ev.metaKey || ev.ctrlKey) {
      ev.preventDefault()
      if (ev.shiftKey && selAnchor !== null) {
        const list = flatVisible()
        const a = list.findIndex((e) => e.rel === selAnchor)
        const b = list.findIndex((e) => e.rel === entry.rel)
        if (a >= 0 && b >= 0) {
          const [lo, hi] = a < b ? [a, b] : [b, a]
          const range = list.slice(lo, hi + 1).map((e) => e.rel)
          setSelected((prev) => new Set([...prev, ...range]))
        }
      } else {
        setSelected((prev) => {
          const n = new Set(prev)
          if (n.has(entry.rel)) n.delete(entry.rel); else n.add(entry.rel)
          return n
        })
      }
      setSelAnchor(entry.rel)
    } else if (isDir) {
      toggle(entry.rel)
    } else {
      insertMarker(entry)
    }
  }
  // 批量插入所选:文件 → 引用;目录 → 目录树文本
  const insertSelected = async (): Promise<void> => {
    const b = getBridge()
    if (!b) return
    const rels = new Set(selected)
    const list = flatVisible().filter((e) => rels.has(e.rel))
    // 统一:文件和目录都插入 @引用(与面板点击、@菜单一致)
    const parts: string[] = []
    for (const e of list) {
      parts.push(refAt(e))
    }
    if (parts.length > 0) b.insert(parts.join('\n'))
    setSelected(new Set())
    setSelAnchor(null)
  }

  const rowFor = (entry: WsEntry, depth: number, isExp: boolean): React.ReactNode => {
    const isDir = entry.type === 'directory'
    const isSel = selected.has(entry.rel)
    const isPreviewActive = preview?.entry.rel === entry.rel
    return (
      <div key={entry.rel} role="button" tabIndex={0}
        className={C('dshwe-row') + (isDir ? ` ${C('dshwe-row-dir')}` : ` ${C('dshwe-row-file')}`) + (isSel ? ` ${C('dshwe-row-sel')}` : '') + (isPreviewActive ? ` ${C('dshwe-row-active')}` : '')}
        style={{ paddingLeft: 10 + depth * 16 }}
        title={entry.path + (isDir ? '' : ` · ${tr('row.tip')}`)}
        draggable
        onDragStart={(ev) => onDragStart(ev, entry)}
        onClick={(ev) => onRowClick(ev, entry)}
        onKeyDown={(ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); if (isDir) toggle(entry.rel); else insertMarker(entry) }
          else if (ev.key === 'p' && !isDir) { ev.preventDefault(); void openPreview(entry) }
        }}>
        <span className={C('dshwe-chev-slot')}>{isDir ? <ChevronSvg open={isExp} /> : null}</span>
        {!isDir ? (
          <button type="button" className={C('dshwe-preview-btn') + (isPreviewActive ? ` ${C('dshwe-preview-btn-on')}` : '')}
            title={tr('edit.preview.tip')} aria-label={tr('edit.preview.tip')}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
            onClick={(e) => { e.stopPropagation(); void openPreview(entry) }}>
            <svg viewBox="0 0 16 16" width={15} height={15} aria-hidden="true">
              <path d="M1.5 8s2.6-4.5 6.5-4.5S14.5 8 14.5 8 11.9 12.5 8 12.5 1.5 8 1.5 8zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
        {iconFor(entry, isExp)}
        <span className={C('dshwe-name')}>{entry.name}</span>
        {!isDir && c.showSize && entry.size != null ? <span className={C('dshwe-size')}>{fmtSize(entry.size)}</span> : null}
        {!isDir && isPreviewActive ? <span className={C('dshwe-row-preview-dot')} /> : null}
      </div>
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
    const noteKey = (tag: string): string => `${rel}::${tag}`
    if (data.truncated) rows.push(<div key={noteKey('trunc')} className={C('dshwe-note')}>{tr('truncated', { n: data.entries.length })}</div>)
    if (data.loading) rows.push(<div key={noteKey('load')} className={C('dshwe-note')}><span className={C('dshwe-spin')} />{tr('loading')}</div>)
    if (data.error) rows.push(<div key={noteKey('err')} className={C('dshwe-note dshwe-note-err')}>{tr('load.fail')}{data.error}</div>)
    return rows
  }

  let body: React.ReactNode
  if (q !== '') {
    const hits: WsEntry[] = []
    collectMatches('', hits)
    body = (
      <>
        <div className={C('dshwe-note')}>{tr('hit', { n: hits.length })}</div>
        {hits.length ? hits.map((h) => rowFor(h, 0, false)) : <div className={C('dshwe-empty')}>{tr('hit.none', { q: filter })}</div>}
      </>
    )
  } else if (root === null) {
    body = (
      <div className={C('dshwe-empty')}>
        <div className={C('dshwe-empty-ico')}>
          <svg viewBox="0 0 16 16" width={17} height={17} aria-hidden="true"><path d={FOLDER_D} fill="currentColor" /></svg>
        </div>
        <div>{tr('empty.title')}</div>
        <button type="button" className={C('dshwe-addbtn')} onClick={() => void addWorkspace()}>{tr('empty.add')}</button>
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
    const isEdit = preview.mode === 'edit'
    const canInline = !preview.loading && !preview.error && !!d && !d.binary && (d.size ?? 0) <= 32768
    const canEdit = !preview.loading && !preview.error && !!d && !d.binary && (d.size ?? 0) <= 4 * 1024 * 1024
    const metaBits: string[] = []
    if (preview.entry.size != null) metaBits.push(fmtSize(preview.entry.size))
    if (d?.lineCount != null && d.lineCount > 0) metaBits.push(tr('preview.lines', { n: d.lineCount }))
    if (!isEdit && (preview.page > 0 || d?.hasMore === true)) metaBits.push(tr('preview.page', { n: preview.page + 1 }))
    if (isEdit && preview.dirty) metaBits.push(tr('edit.dirty'))

    let contentArea: React.ReactNode
    if (preview.loading) {
      contentArea = <div className={C('dshwe-note')}><span className={C('dshwe-spin')} />{tr('read')}</div>
    } else if (preview.error) {
      contentArea = <div className={C('dshwe-note dshwe-note-err')}>{tr('read.fail')}{preview.error}</div>
    } else if (d?.binary) {
      contentArea = <div className={C('dshwe-note')}>{tr('binary')}</div>
    } else if (isEdit) {
      contentArea = (
        <textarea className={C('dshwe-editor')} value={preview.editContent}
          onChange={(e) => updateEditContent(e.target.value)}
          spellCheck={false} />
      )
    } else {
      contentArea = <pre className={C('dshwe-preview-pre')}>{d?.content ?? ''}</pre>
    }

    pv = (
      <div className={C('dshwe-preview-panel')}>
        <div className={C('dshwe-preview-head')}>
          <div className={C('dshwe-preview-name')}>{preview.entry.name}</div>
          <div className={C('dshwe-preview-meta')}>{metaBits.join(' · ')}</div>
          {isEdit ? (
            <>
              {preview.saving ? <span className={C('dshwe-edit-saving')}>{tr('edit.saving')}</span> : null}
              {preview.saveError ? <span className={C('dshwe-edit-saveerr')}>{preview.saveError}</span> : null}
              <button type="button" className={C('dshwe-prevbtn')} onClick={() => void saveFile()} disabled={preview.saving || !preview.dirty}>{tr('edit.save')}</button>
              <button type="button" className={C('dshwe-prevbtn')} onClick={discardEdit}>{tr('edit.discard')}</button>
              <button type="button" className={C('dshwe-prevbtn')} style={{ width: 28, padding: 0 }} onClick={cancelEdit} title={tr('edit.cancel')} aria-label={tr('edit.cancel')}>
                <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
              </button>
            </>
          ) : (
            <>
              <button type="button" className={C('dshwe-pager-btn')} disabled={preview.page === 0 || preview.loading} onClick={previewPrev} title={tr('preview.prev')} aria-label={tr('preview.prev')}>‹</button>
              <button type="button" className={C('dshwe-pager-btn')} disabled={d?.hasMore !== true || preview.loading} onClick={previewNext} title={tr('preview.next')} aria-label={tr('preview.next')}>›</button>
              {canEdit ? <button type="button" className={C('dshwe-prevbtn')} onClick={() => void enterEditMode()}>{tr('edit')}</button> : null}
              <button type="button" className={C('dshwe-icobtn')} onClick={() => setPreview(null)} title={tr('close.preview')} aria-label={tr('close.preview')}>
                <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
              </button>
            </>
          )}
        </div>
        {contentArea}
        {!isEdit ? (
          <div className={C('dshwe-preview-actions')}>
            <button type="button" className={C('dshwe-prevbtn')} onClick={() => insertMarker(preview.entry)}>{tr('btn.ref')}</button>
            <button type="button" className={C('dshwe-prevbtn')} disabled={!canInline}
              title={canInline ? tr('btn.content.tip') : tr('btn.content.no')} onClick={() => void insertContent()}>{tr('btn.content')}</button>
          </div>
        ) : null}
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
      {selected.size > 0 ? (
        <div className={C('dshwe-selbar')}>
          <span className={C('dshwe-selbar-count')}>{tr('sel.count', { n: selected.size })}</span>
          <button type="button" className={C('dshwe-prevbtn')} onClick={() => void insertSelected()}>{tr('sel.insert')}</button>
          <button type="button" className={C('dshwe-prevbtn')} onClick={() => { setSelected(new Set()); setSelAnchor(null) }}>{tr('sel.clear')}</button>
        </div>
      ) : null}
    </>
  )

  return (
    <div className={C('dshwe-panel')} ref={(el) => {
      // 通知 popup 更新宽度:preview 打开时撑宽,关闭时缩回
      if (el?.parentElement) {
        const expanded = !!pv
        el.parentElement.style.width = expanded ? `calc(var(--dshwe-base-w, 384px) + 340px)` : `var(--dshwe-base-w, 384px)`
      }
    }}>
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
      {tab === 'files' ? (
        <div className={C('dshwe-body')}>
          {pv ? <div className={C('dshwe-preview-slot')}>{pv}</div> : null}
          <div className={C('dshwe-tree-col')}>{filesBody}</div>
        </div>
      ) : <div className={C('dshwe-tabbody')}><SettingsView /></div>}
    </div>
  )
}

// ---------- 弹窗根:浮动面板,位于顶部 header 与输入框之间,带展开/收起动画 ----------
function DrawerRoot(props: {
  useWorkspaces: (s: unknown) => unknown
  useSessions: (s: unknown) => unknown
}) {
  const [on, setOn] = useState(getOpen())
  const [shown, setShown] = useState(getOpen())
  const [closing, setClosing] = useState(false)
  const [rect, setRect] = useState({ top: 48, height: 480 })
  const [dragKind, setDragKind] = useState<'file' | 'dir' | null>(null)
  const [c, setC] = useState(getCfg())
  useEffect(() => subscribeOpen(setOn), [])
  useEffect(() => subscribeCfg(setC), [])
  // 打开/收起动画:打开先挂载再置 shown,关闭保留挂载 ~200ms 让过渡播完
  useEffect(() => {
    if (on) {
      setClosing(false)
      setShown(false)
      const raf = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(raf)
    }
    setShown(false)
    setClosing(true)
    const t = setTimeout(() => setClosing(false), 200)
    return () => clearTimeout(t)
  }, [on])
  // Esc 关闭弹窗
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') closeDrawer() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
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
    const readPayload = (e: DragEvent): { root?: string; rel?: string; name?: string; type?: string } | null => {
      const raw = e.dataTransfer?.getData(MARKER) ?? ''
      try { return raw ? JSON.parse(raw) as { root?: string; rel?: string; name?: string; type?: string } : null } catch { return null }
    }
    const onDragOver = (e: DragEvent): void => { if (!hasMarker(e)) return; e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy' }
    const onDrop = (e: DragEvent): void => {
      if (!hasMarker(e)) return
      const payload = readPayload(e)
      const target = e.target instanceof HTMLElement ? e.target : null
      const inComposer = !!target?.closest('[data-composer-card] textarea')
      // 目录:插入 @引用(与面板点击一致)
      if (payload?.type === 'directory') {
        e.preventDefault(); e.stopPropagation(); setDragKind(null)
        const b = getBridge()
        if (b && payload.rel) {
          const root = payload.root ?? getEffectiveRoot()
          const useRel = cfg.refStyle === 'relative' && root !== null && root === activeCwd
          const absPath = root ? `${root.replace(/\/+$/, '')}/${payload.rel}` : payload.rel
          const p = useRel ? payload.rel : absPath
          b.insert(`@${p}/`)
        } else if (!b) {
          console.warn('[dsh-workspace-explorer] drop: bridge not set, cannot insert directory reference')
        }
        return
      }
      // 文件:插入 @引用
      if (inComposer) { setDragKind(null); return }
      e.preventDefault(); e.stopPropagation(); setDragKind(null)
      const b = getBridge()
      if (b && payload?.rel) {
        const isDir = payload.type === 'directory'
        // 统一格式:尊重 refStyle 设置
        const root = payload.root ?? getEffectiveRoot()
        const useRel = cfg.refStyle === 'relative' && root !== null && root === activeCwd
        const absPath = root ? `${root.replace(/\/+$/, '')}/${payload.rel}` : payload.rel
        const p = useRel ? payload.rel : absPath
        b.insert(isDir ? `@${p}/` : `@${p}`)
      } else if (!b) {
        console.warn('[dsh-workspace-explorer] drop: bridge not set, cannot insert file reference')
      }
    }
    const onDragEnd = (): void => setDragKind(null)
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
      {dragKind !== null ? <div className={C('dshwe-hint')}><div className={C('dshwe-hint-chip')}><svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true"><path d="M8 3.5v6M5.7 7.2L8 9.5l2.3-2.3M3.5 12.5h9" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>{dragKind === 'dir' ? tr('drop.hint.dir') : tr('drop.hint')}</div></div> : null}
      {on || closing ? <div className={C('dshwe-popup') + (shown ? ` ${C('dshwe-popup-on')}` : '')} style={{ top: rect.top, height: rect.height, '--dshwe-base-w': `${c.width}px` } as React.CSSProperties}><Panel {...props} onDraggingChange={setDragKind} /></div> : null}
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
  inject(deps: string[], callback: (scope: unknown) => unknown): void
}

export const inject = ['slots', 'locale']

export function apply(ctx: CtxLike): void {
  const slots = ctx.get('slots') as SlotsLike | undefined
  if (slots === undefined) return
  workspacesSvc = (ctx.get('workspaces') as WorkspacesSvcLike | undefined) ?? null
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

  // ---------- 自动推导工作区根目录(面板未打开时,从 sessions 服务获取 cwd) ----------
  // 这样 @ 触发源即使面板未打开也能搜索文件
  try {
    ctx.inject(['sessions'], (scope) => {
      const sessions = (scope as unknown as { sessions?: { list: { subscribe: (fn: () => void) => () => void; getSnapshot: () => { current?: string; byId?: Record<string, { cwd?: string }> } } } }).sessions
      if (sessions === undefined) return
      const update = (): void => {
        const snap = sessions.list.getSnapshot()
        const currentId = snap.current
        const currentSummary = currentId && snap.byId ? snap.byId[currentId] : undefined
        const cwd = currentSummary?.cwd ?? null
        activeCwd = cwd
        // 只在面板未主动设置根目录时使用 sessions cwd 作为 fallback
        if (activeWorkspaceRoot === null) {
          sessionsCwdRoot = cwd
          if (cwd !== null) {
            console.info('[dsh-workspace-explorer] auto-discovered workspace root from session:', cwd)
          }
        }
      }
      update()
      return sessions.list.subscribe(update)
    })
  } catch {
    // sessions 服务不可用时静默忽略(不影响核心功能)
  }

  // ---------- 自动设置输入桥:从 conversation.input 服务获取 inputActions ----------
  // DockBridge 可能未挂载(会话未激活或 dock 槽位未渲染),这里作为 fallback
  try {
    ctx.inject(['sessions', 'conversation'], (scope) => {
      const sessions = (scope as unknown as { sessions?: { list: { subscribe: (fn: () => void) => () => void; getSnapshot: () => { current?: string } }; scope: (id: string) => unknown } }).sessions
      const conversation = (scope as unknown as { conversation?: { input: { for: (scope: unknown) => { actions?: { setDraft(text: string): void } } } } }).conversation
      if (sessions === undefined || conversation === undefined) return
      const update = (): void => {
        const snap = sessions.list.getSnapshot()
        const currentId = snap.current
        if (!currentId) return
        try {
          const actx = sessions.scope(currentId)
          if (actx === undefined) return
          const inputFace = conversation.input.for(actx)
          const inputActions = inputFace?.actions
          if (inputActions && typeof inputActions.setDraft === 'function') {
            // 只在 bridge 未设置时更新(DockBridge 优先)
            if (bridge === null) {
              setBridge({
                insert(text: string) {
                  // 获取当前 draft(通过 DOM 读取或 input face)
                  const textarea = document.querySelector('[data-composer-card] textarea') as HTMLTextAreaElement | null
                  const draft = textarea?.value ?? ''
                  const sep = draft === '' || draft.endsWith('\n') ? '' : '\n'
                  inputActions.setDraft(draft + sep + text)
                },
              })
              console.info('[dsh-workspace-explorer] bridge set via conversation.input fallback')
            }
          }
        } catch {
          // session scope 不可用时忽略
        }
      }
      update()
      return sessions.list.subscribe(update)
    })
  } catch {
    // conversation 服务不可用时静默忽略
  }

  // ---------- 注册 @ 触发源:工作区文件搜索(@纯文本引用) ----------
  // inputTriggers 由 @deepseek-ai/dsh-client-ui-input-trigger 在独立 fiber 上提供(非 root),
  // 直接 ctx.inputTriggers 会抛 "cannot get property inputTriggers without inject"。
  // 用 ctx.inject 动态注入:inputTriggers 就绪时注册源、卸载时自动摘除,且不阻塞主插件。
  ctx.inject(['inputTriggers'], (scope) => {
    const triggers = (scope as unknown as { inputTriggers?: { registerSource(src: InputTriggerSource): () => void } }).inputTriggers
    if (triggers === undefined) return
    console.info('[dsh-workspace-explorer] registering @ trigger source')
    return triggers.registerSource({
          trigger: '@',
          name: 'workspace-files',
          order: 10,

          async candidates(_session, req) {
            const root = getEffectiveRoot()
            if (!root) {
              console.debug('[dsh-workspace-explorer] @ candidates: no workspace root available')
              return []
            }
            const files = await fetchAllFiles(root)
            const q = req.query.toLowerCase()
            const list = q !== ''
              ? files.filter((f) => f.name.toLowerCase().includes(q) || f.rel.toLowerCase().includes(q))
              : files
            console.debug(`[dsh-workspace-explorer] @ candidates: ${list.length} files from ${root}`)
            return list.slice(0, 50).map((f) => ({
              name: f.name,
              description: f.type === 'directory' ? `${f.rel}/` : f.rel,
            }))
          },

          onPick(pick) {
            // 统一格式:与面板 refAt 一致 — @前缀 + 尊重 refStyle 设置
            const desc = pick.candidate.description ?? pick.candidate.name
            const isDir = desc.endsWith('/')
            const rel = isDir ? desc.slice(0, -1) : desc
            // 从文件缓存查找对应的绝对路径
            const cached = fileCache.find((f) => f.rel === rel)
            const absPath = cached?.path ?? rel
            const root = getEffectiveRoot()
            const useRel = cfg.refStyle === 'relative' && root !== null && root === activeCwd
            const p = useRel ? rel : absPath
            console.debug('[dsh-workspace-explorer] @ onPick:', isDir ? `@${p}/` : `@${p}`)
            return { text: isDir ? `@${p}/` : `@${p}` }
          },

          lexicon(_session) {
            // 返回文件路径,让 @path/to/file 被高亮装饰
            const root = getEffectiveRoot()
            if (!root || fileCache.length === 0 || fileCacheRoot !== root) return undefined
            const paths: string[] = []
            for (const f of fileCache) {
              paths.push(f.type === 'directory' ? `${f.rel}/` : f.rel)
              if (paths.length >= 500) break
            }
            return paths
          },
        })
  })

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
