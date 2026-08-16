// dsh-workspace-explorer — Client 半区（动态 Cordis 插件代码）
//
// 在 DeepSeek Harness 的动态插件“Client 代码”框中粘贴本文件内容即可。
// 职责：右侧浮层面板（对齐 DSH 原生弹窗风格）+ 工作区文件树 + 文件类型图标 +
// 点击/拖拽插入引用 + 文件名搜索过滤 + 文件预览（前 60 行 / 小文件内联插入）+
// 国际化（zh/en 词典，跟随 DSH 界面语言）。
// 注意：动态插件要求纯 JavaScript + React.createElement，禁止 import / TypeScript / JSX。
return {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    const workspacesSvc = ctx.get('workspaces')
    const locale = ctx.get('locale')

    const MARKER = 'application/x-dsh-ws-file'
    const el = React.createElement

    // ---- 国际化：注册 zh/en 词典，跟随 DSH 界面语言 ----
    const NS = 'dsh-workspace-explorer'
    const DICTS = {
      zh: {
        'panel.title': '工作区文件',
        'ws.current': '当前目录',
        'search.ph': '搜索文件(仅已加载目录)…',
        'hint': '点击文件或拖拽到输入框,发送给模型',
        'empty.title': '还没有可浏览的工作区。选择一个项目文件夹,即可在这里查看目录文件。',
        'empty.add': '+ 选择文件夹作为工作区',
        'loading.ws': '正在加载工作区…',
        'hit': '匹配 {n} 项',
        'hit.none': '没有匹配「{q}」的文件(搜索范围:已加载目录)',
        'truncated': '已截断,仅显示前 {n} 项',
        'loading': '加载中…',
        'load.fail': '加载失败: ',
        'read': '读取中…',
        'read.fail': '读取失败: ',
        'too.large': '文件过大({s}),仅支持插入引用',
        'binary': '二进制文件,仅支持插入引用',
        'lines.tail': '…(共 {n} 行,仅显示前 60 行)',
        'btn.ref': '插入引用',
        'btn.content': '插入内容',
        'btn.content.tip': '把文件内容插入输入框',
        'btn.content.no': '文件过大或二进制,无法内联',
        'sidebar.tooltip': '工作区文件',
        'sidebar.label': '文件',
        'refresh': '刷新',
        'close': '关闭',
        'close.preview': '关闭预览',
        'row.tip': '点击或拖拽到输入框',
        'preview.tip': '预览 (P)',
        'insert.tip': '插入引用',
        'drop.hint': '松开以插入文件引用到输入框',
        'add.ws': '添加工作区',
      },
      en: {
        'panel.title': 'Workspace Files',
        'ws.current': 'Current dir',
        'search.ph': 'Search files (loaded dirs only)…',
        'hint': 'Click a file or drag it into the composer to send',
        'empty.title': 'No browsable workspace yet. Pick a project folder to view its files.',
        'empty.add': '+ Choose a folder as workspace',
        'loading.ws': 'Loading workspaces…',
        'hit': '{n} match(es)',
        'hit.none': 'No files match "{q}" (search covers loaded dirs)',
        'truncated': 'Truncated: showing the first {n}',
        'loading': 'Loading…',
        'load.fail': 'Load failed: ',
        'read': 'Reading…',
        'read.fail': 'Read failed: ',
        'too.large': 'File too large ({s}); reference only',
        'binary': 'Binary file; reference only',
        'lines.tail': '…({n} lines total, showing the first 60)',
        'btn.ref': 'Insert reference',
        'btn.content': 'Insert content',
        'btn.content.tip': 'Insert the file content into the composer',
        'btn.content.no': 'Too large or binary — cannot inline',
        'sidebar.tooltip': 'Workspace Files',
        'sidebar.label': 'Files',
        'refresh': 'Refresh',
        'close': 'Close',
        'close.preview': 'Close preview',
        'row.tip': 'click or drag to the composer',
        'preview.tip': 'Preview (P)',
        'insert.tip': 'Insert reference',
        'drop.hint': 'Release to insert the file reference into the composer',
        'add.ws': 'Add workspace',
      },
    }
    let tr = (k, vars) => { let s = DICTS.zh[k] || k; if (vars) for (const key in vars) s = s.split('{' + key + '}').join(String(vars[key])); return s }
    if (locale !== undefined) {
      try {
        ctx.effect(() => {
          const d1 = locale.register(NS, 'zh', DICTS.zh)
          const d2 = locale.register(NS, 'en', DICTS.en)
          return () => { d1(); d2() }
        })
        const t = locale.bind(NS)
        tr = (k, vars) => {
          let s = t(k)
          if (typeof s !== 'string' || s === k) s = DICTS.zh[k] || k
          if (vars) for (const key in vars) s = s.split('{' + key + '}').join(String(vars[key]))
          return s
        }
      } catch (err) {
        console.warn('locale init failed, fallback zh', String(err && err.message ? err.message : err))
      }
    }

    styles.insert(`
.dshwe-layer { position: fixed; inset: 0; z-index: 100; pointer-events: none; }
.dshwe-panel {
  position: absolute; top: 14px; right: 14px; bottom: auto;
  width: 384px; height: min(640px, calc(100dvh - 110px)); min-height: 320px;
  pointer-events: auto;
  display: flex; flex-direction: column;
  background: var(--dsw-alias-bg-layer-2, #262626);
  border: 1px solid var(--dsw-alias-border-inverted, rgba(128,128,128,.28));
  border-radius: 24px;
  box-shadow: var(--dsw-shadow-lv3, 0 12px 32px rgba(0,0,0,.25));
  color: var(--dsw-alias-label-primary, #e8e8e8);
  font: 13px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2, rgba(128,128,128,.4));
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2, rgba(128,128,128,.6));
}
.dshwe-head {
  display: flex; align-items: center; gap: 8px; flex: none;
  padding: 14px 16px 12px 18px;
  border-bottom: 1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.2));
}
.dshwe-head-ico { color: var(--dsw-alias-state-business-primary, #4176e6); display: inline-flex; flex: none; }
.dshwe-title { font-size: 15px; font-weight: 600; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dshwe-icobtn { border: 0; background: transparent; color: var(--dsw-alias-label-secondary, #9a9a9a); width: 28px; height: 28px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.dshwe-icobtn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.14)); color: var(--dsw-alias-label-primary, #e8e8e8); }
.dshwe-selrow { display: flex; gap: 8px; padding: 12px 16px 4px; align-items: center; }
.dshwe-sel, .dshwe-filter {
  flex: 1; min-width: 0; height: 30px;
  background: transparent; color: var(--dsw-alias-label-primary, #e8e8e8);
  border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35));
  border-radius: 8px; padding: 0 8px; font: inherit; font-size: 12.5px; outline: none;
}
.dshwe-sel:focus-visible, .dshwe-filter:focus-visible { border-color: var(--dsw-alias-state-business-primary, #4176e6); }
.dshwe-filter::placeholder { color: var(--dsw-alias-label-caption, #8a8a8a); }
.dshwe-filterrow { display: flex; gap: 6px; padding: 0 16px 6px; align-items: center; }
.dshwe-filter-clear { flex: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary, #9a9a9a); width: 26px; height: 26px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.dshwe-filter-clear:hover { color: var(--dsw-alias-label-primary, #e8e8e8); background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12)); }
.dshwe-addbtn {
  flex: none; height: 30px; padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35));
  background: transparent; color: var(--dsw-alias-label-secondary, #9a9a9a);
  border-radius: 8px; font: inherit; font-size: 12.5px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 3px;
}
.dshwe-addbtn:hover { color: var(--dsw-alias-label-primary, #e8e8e8); background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12)); }
.dshwe-hintline { display: flex; align-items: center; gap: 6px; padding: 0 18px 8px; color: var(--dsw-alias-label-caption, #8a8a8a); font-size: 11px; }
.dshwe-tree { flex: 1; overflow: auto; padding: 2px 6px 10px; }
.dshwe-row {
  display: flex; align-items: center; gap: 7px; padding: 4.5px 10px;
  cursor: pointer; user-select: none; white-space: nowrap;
  border: 0; width: 100%; text-align: left; background: transparent; color: inherit; font: inherit;
  border-radius: 10px;
}
.dshwe-row:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12)); }
.dshwe-row-file { cursor: grab; }
.dshwe-row-file:active { cursor: grabbing; }
.dshwe-chev-slot { width: 14px; flex: none; display: inline-flex; align-items: center; justify-content: center; }
.dshwe-chev { color: var(--dsw-alias-label-dimmed, #777); transition: transform .16s ease; display: inline-flex; }
.dshwe-chev-on { transform: rotate(90deg); }
@media (prefers-reduced-motion: reduce) { .dshwe-chev { transition: none } }
.dshwe-ico { flex: none; display: inline-flex; align-items: center; justify-content: center; }
.dshwe-folder-svg { color: #dcb67a; }
.dshwe-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 12.5px; }
.dshwe-row-dir .dshwe-name { font-weight: 600; }
.dshwe-size { flex: none; color: var(--dsw-alias-label-caption, #8a8a8a); font-size: 11px; font-variant-numeric: tabular-nums; padding-left: 6px; }
.dshwe-eye, .dshwe-insert { flex: none; display: inline-flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .12s ease; color: var(--dsw-alias-label-secondary, #9a9a9a); cursor: pointer; }
.dshwe-eye:hover { color: var(--dsw-alias-state-business-primary, #4176e6); }
.dshwe-insert { color: var(--dsw-alias-state-business-primary, #4176e6); }
.dshwe-row:hover .dshwe-eye, .dshwe-row:hover .dshwe-insert, .dshwe-row:focus-visible .dshwe-insert { opacity: 1; }
.dshwe-note { padding: 6px 16px; color: var(--dsw-alias-label-caption, #8a8a8a); font-size: 12px; display: flex; align-items: center; gap: 8px; }
.dshwe-note-err { color: var(--dsw-alias-state-error-primary, #e5484d); }
.dshwe-spin { width: 13px; height: 13px; flex: none; border: 2px solid var(--dsw-alias-border-l2, rgba(128,128,128,.4)); border-top-color: var(--dsw-alias-state-business-primary, #4176e6); border-radius: 50%; animation: dshwe-spin .7s linear infinite; }
@keyframes dshwe-spin { to { transform: rotate(360deg) } }
@media (prefers-reduced-motion: reduce) { .dshwe-spin { animation-duration: 1.6s } }
.dshwe-empty { padding: 20px 18px; color: var(--dsw-alias-label-secondary, #9a9a9a); font-size: 12.5px; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.dshwe-empty-ico { color: var(--dsw-alias-label-dimmed, #777); opacity: .8; }
.dshwe-preview {
  flex: none; max-height: 46%; display: flex; flex-direction: column;
  border-top: 1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.2));
  background: var(--dsw-alias-bg-layer-1, #222);
}
.dshwe-preview-head { display: flex; align-items: center; gap: 8px; padding: 10px 14px 6px; }
.dshwe-preview-name { font-size: 12.5px; font-weight: 600; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dshwe-preview-meta { font-size: 11px; color: var(--dsw-alias-label-caption, #8a8a8a); flex: none; }
.dshwe-preview-pre {
  flex: 1; overflow: auto; margin: 0; padding: 4px 14px 10px;
  font: 11.5px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--dsw-alias-label-primary, #e8e8e8); white-space: pre;
}
.dshwe-preview-actions { display: flex; align-items: center; gap: 8px; padding: 0 14px 10px; }
.dshwe-prevbtn {
  flex: none; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35)); background: transparent;
  color: var(--dsw-alias-label-secondary, #9a9a9a); border-radius: 8px; padding: 4px 10px;
  font: inherit; font-size: 12px; cursor: pointer;
}
.dshwe-prevbtn:hover { color: var(--dsw-alias-label-primary, #e8e8e8); background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12)); }
.dshwe-prevbtn.primary { color: #fff; background: var(--dsw-alias-state-business-primary, #4176e6); border-color: transparent; }
.dshwe-prevbtn.primary:hover { opacity: .9; }
.dshwe-prevbtn:disabled { opacity: .45; cursor: not-allowed; }
.dshwe-hint { position: absolute; inset: 10px; border: 1.5px dashed var(--dsw-alias-state-business-primary, #4176e6); border-radius: 20px; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.dshwe-hint-chip { display: flex; align-items: center; gap: 7px; background: var(--dsw-alias-bg-layer-2, #262626); color: var(--dsw-alias-label-primary, #e8e8e8); padding: 9px 15px; border-radius: 999px; font-size: 13px; box-shadow: var(--dsw-shadow-lv2, 0 4px 12px rgba(0,0,0,.25)); }
.dshwe-hint-chip svg { color: var(--dsw-alias-state-business-primary, #4176e6); }
.dshwe-act { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--dsw-alias-label-secondary, #9a9a9a); padding: 5px 8px; border-radius: 8px; cursor: pointer; font: inherit; }
.dshwe-act:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12)); color: var(--dsw-alias-label-primary, #e8e8e8); }
.dshwe-act-on { color: var(--dsw-alias-state-business-primary, #4176e6); }
.dshwe-row:focus-visible, .dshwe-icobtn:focus-visible, .dshwe-act:focus-visible, .dshwe-addbtn:focus-visible, .dshwe-prevbtn:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4176e6); outline-offset: -2px; }
`)

    // ---- 面板开关的共享状态（侧边栏按钮 <-> 浮层面板） ----
    const openListeners = new Set()
    let open = false
    const getOpen = () => open
    const setOpen = (v) => { open = v; openListeners.forEach((fn) => fn(open)) }
    const subscribeOpen = (fn) => { openListeners.add(fn); return () => { openListeners.delete(fn) } }

    // ---- 输入桥：由 conversation.input.dock 槽位捕获 inputActions ----
    let bridge = null
    const setBridge = (b) => { bridge = b }
    const getBridge = () => bridge

    const fmtSize = (n) => {
      if (n == null) return ''
      if (n < 1024) return n + ' B'
      if (n < 1048576) return (n / 1024).toFixed(1) + ' KB'
      return (n / 1048576).toFixed(1) + ' MB'
    }
    const basename = (p) => { const s = String(p).replace(/\/+$/, ''); const i = s.lastIndexOf('/'); return i >= 0 ? s.slice(i + 1) : s }
    const extOf = (name) => { const i = String(name).lastIndexOf('.'); return i <= 0 ? '' : String(name).slice(i + 1).toLowerCase() }

    // ---- 图标系统 ----
    const FOLDER_D = 'M1.5 2.5A1.5 1.5 0 0 1 3 1h3.2l1.6 2H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5v-9z'
    const DOC_BODY = 'M4.3 1.7h5.3l2.7 2.7v8.9a1 1 0 0 1-1 1H4.3a1 1 0 0 1-1-1V2.7a1 1 0 0 1 1-1z'
    const DOC_FOLD = 'M9.6 1.7L12.3 4.4H9.6z'
    const GLYPHS = {
      code: 'M6.4 6.1L4.9 8l1.5 1.9M9.6 6.1l1.5 1.9L9.6 9.9',
      image: 'M3.6 12.4l2.7-2.7 1.8 1.8 1.5-1.5 2.8 2.4M5.4 6.4a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z',
      markdown: 'M5.1 11.2l1.9-2.9 1.9 2.9M5.1 8.4h3.8',
      config: 'M3.2 5.6h3.6M9 5.6h3.8M3.2 10.4h3.6M9 10.4h3.8M7.4 3.8v3.6M7.4 8.6v3.6',
      css: 'M6.2 4.4v7.2M9.8 4.4v7.2M4.9 6.9h6.2M4.9 9.1h6.2',
      shell: 'M3.6 5.4l2.4 2.6L3.6 10.6M8.1 10.6h4.3',
      plain: '',
    }
    const FILE_META = {
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
    const DEFAULT_META = ['#8a919c', 'plain']

    const fileSvg = (color, glyph) => {
      const kids = [
        el('path', { key: 'body', d: DOC_BODY, fill: color }),
        el('path', { key: 'fold', d: DOC_FOLD, fill: 'rgba(255,255,255,.92)' }),
      ]
      if (glyph) kids.push(el('path', { key: 'g', d: glyph, fill: 'none', stroke: '#fff', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }))
      return el('svg', { viewBox: '0 0 16 16', width: 16, height: 16, className: 'dshwe-ico', 'aria-hidden': true }, kids)
    }
    const folderSvg = (open) => el('svg', { viewBox: '0 0 16 16', width: 16, height: 16, className: 'dshwe-ico dshwe-folder-svg', 'aria-hidden': true },
      el('path', { d: FOLDER_D, fill: open ? '#e8c47c' : '#dcb67a' }))
    const iconFor = (entry, open) => {
      if (entry.type === 'directory') return folderSvg(open)
      const meta = FILE_META[extOf(entry.name)] || DEFAULT_META
      return fileSvg(meta[0], meta[1])
    }
    const chevronSvg = (expanded) => el('svg', {
      viewBox: '0 0 16 16', width: 14, height: 14,
      className: 'dshwe-chev' + (expanded ? ' dshwe-chev-on' : ''),
      'aria-hidden': true,
    }, el('path', { d: 'M6 4l4 4-4 4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }))
    const headFolderSvg = el('svg', { viewBox: '0 0 16 16', width: 17, height: 17, 'aria-hidden': true },
      el('path', { d: FOLDER_D, fill: 'currentColor' }))
    const insertSvg = el('svg', { viewBox: '0 0 16 16', width: 13, height: 13, 'aria-hidden': true },
      el('path', { d: 'M8 2.5v7.5M5.7 7.5L8 9.8l2.3-2.3M3.5 12.5h9', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }))
    const eyeSvg = el('svg', { viewBox: '0 0 16 16', width: 13, height: 13, 'aria-hidden': true },
      el('path', { d: 'M1.5 8s2.6-4.5 6.5-4.5S14.5 8 14.5 8 11.9 12.5 8 12.5 1.5 8 1.5 8zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }))
    const dropSvg = el('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true },
      el('path', { d: 'M8 3.5v6M5.7 7.2L8 9.5l2.3-2.3M3.5 12.5h9', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }))

    // ---- 侧边栏底部开关按钮 ----
    function SidebarAction(props) {
      const [on, setOn] = React.useState(getOpen())
      React.useEffect(() => subscribeOpen(setOn), [])
      const wide = props.wide === true
      return el('button', {
        type: 'button',
        className: 'dshwe-act' + (on ? ' dshwe-act-on' : ''),
        onClick: () => setOpen(!getOpen()),
        title: tr('sidebar.tooltip'),
        'aria-label': tr('sidebar.tooltip'),
        'aria-pressed': on,
      },
        el('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true },
          el('path', { d: FOLDER_D, fill: 'currentColor' })),
        wide ? el('span', null, tr('sidebar.label')) : null,
      )
    }

    // ---- 输入桥组件：仅捕获最新的 draft 与 setDraft ----
    function DockBridge(props) {
      const input = props.useInput((s) => s)
      const actions = props.inputActions
      const draftRef = React.useRef(input.draft)
      draftRef.current = input.draft
      React.useEffect(() => {
        if (!actions) return
        setBridge({
          insert(text) {
            const draft = draftRef.current
            const sep = draft === '' || draft.endsWith('\n') ? '' : '\n'
            actions.setDraft(draft + sep + text)
          },
        })
      }, [actions])
      return null
    }

    // ---- 右侧面板 ----
    function Panel(props) {
      const wsState = props.useWorkspaces((s) => s)
      const sessions = props.useSessions((s) => s)
      const workspaces = wsState.items || []
      const currentSummary = sessions.current ? sessions.byId[sessions.current] : undefined
      const cwd = currentSummary ? currentSummary.cwd : undefined

      const [root, setRoot] = React.useState(null)
      const [dirs, setDirs] = React.useState({})
      const [expanded, setExpanded] = React.useState({})
      const [filter, setFilter] = React.useState('')
      const [preview, setPreview] = React.useState(null)

      const recentItem = workspaces.find((w) => w.workspaceId === wsState.recentWorkspaceId)
      const firstItem = workspaces[0]

      React.useEffect(() => {
        if (root !== null) return
        const cand = cwd || (recentItem && recentItem.path) || (firstItem && firstItem.path)
        if (cand) setRoot(cand)
      }, [root, cwd, wsState.state, recentItem, firstItem])

      const loadDir = React.useCallback(async (r, rel) => {
        setDirs((d) => ({ ...d, [rel]: { loading: true, error: null, entries: (d[rel] && d[rel].entries) || [], truncated: false } }))
        try {
          const res = await host.call('ws-tree.list', { path: r, rel })
          if (!res || res.ok !== true) throw new Error((res && res.error) || 'unknown')
          setDirs((d) => ({ ...d, [rel]: { loading: false, error: null, entries: res.entries, truncated: res.truncated === true } }))
        } catch (err) {
          setDirs((d) => ({ ...d, [rel]: { loading: false, error: String((err && err.message) || err), entries: [], truncated: false } }))
        }
      }, [])

      React.useEffect(() => {
        if (root === null) return
        setDirs({})
        setExpanded({})
        setPreview(null)
        loadDir(root, '')
      }, [root, loadDir])

      const toggle = (rel) => {
        const willExpand = !expanded[rel]
        setExpanded((e) => { const n = { ...e }; if (willExpand) n[rel] = true; else delete n[rel]; return n })
        if (willExpand && root) loadDir(root, rel)
      }

      const refresh = () => {
        if (root === null) return
        loadDir(root, '')
        Object.keys(expanded).forEach((rel) => { if (rel !== '') loadDir(root, rel) })
      }

      const markerFor = (entry) => root === cwd ? '[file: ' + entry.rel + ']' : '[file: ' + entry.path + ']'

      const insertMarker = (entry) => {
        const b = getBridge()
        if (b) b.insert(markerFor(entry))
      }

      const openPreview = async (entry) => {
        setPreview({ entry, loading: true, data: null, error: null })
        try {
          const res = await host.call('ws-tree.peek', { path: entry.path })
          if (!res || res.ok !== true) throw new Error((res && res.error) || 'unknown')
          setPreview({ entry, loading: false, data: res, error: null })
        } catch (err) {
          setPreview({ entry, loading: false, data: null, error: String((err && err.message) || err) })
        }
      }

      const insertContent = () => {
        if (!preview || !preview.data || preview.data.tooLarge || preview.data.binary || preview.data.size > 32768) return
        const b = getBridge()
        if (b) b.insert('\n' + preview.data.content + '\n')
      }

      const onDragStart = (ev, entry) => {
        ev.dataTransfer.setData('text/plain', markerFor(entry))
        ev.dataTransfer.setData(MARKER, JSON.stringify({ path: entry.path, rel: entry.rel, name: entry.name }))
        ev.dataTransfer.effectAllowed = 'copy'
        props.onDraggingChange(true)
      }

      const addWorkspace = async () => {
        if (!workspacesSvc) return
        const p = await workspacesSvc.pickDirectory()
        if (p) {
          const v = await workspacesSvc.create({ path: p })
          setRoot(v.path)
        }
      }

      const q = filter.trim().toLowerCase()
      const collectMatches = (rel, depth, out) => {
        const data = dirs[rel]
        if (!data) return
        for (const entry of data.entries) {
          if (entry.name.toLowerCase().indexOf(q) >= 0) out.push({ entry, depth })
          if (entry.type === 'directory') collectMatches(entry.rel, depth + 1, out)
        }
      }

      const rowFor = (entry, depth, isExp) => {
        const isDir = entry.type === 'directory'
        return el('button', {
          key: entry.rel,
          type: 'button',
          className: 'dshwe-row' + (isDir ? ' dshwe-row-dir' : ' dshwe-row-file') + (isExp ? ' dshwe-row-exp' : ''),
          style: { paddingLeft: 10 + depth * 16 },
          title: entry.path + (isDir ? '' : ' · ' + tr('row.tip')),
          draggable: !isDir,
          onDragStart: isDir ? undefined : (ev) => onDragStart(ev, entry),
          onClick: isDir ? () => toggle(entry.rel) : () => insertMarker(entry),
          onKeyDown: (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); if (isDir) toggle(entry.rel); else insertMarker(entry) }
            else if (ev.key === 'p' && !isDir) { ev.preventDefault(); openPreview(entry) }
          },
        },
          el('span', { className: 'dshwe-chev-slot' }, isDir ? chevronSvg(isExp) : null),
          iconFor(entry, isExp),
          el('span', { className: 'dshwe-name' }, entry.name),
          !isDir && entry.size != null ? el('span', { className: 'dshwe-size' }, fmtSize(entry.size)) : null,
          !isDir ? el('span', {
            className: 'dshwe-eye', title: tr('preview.tip'), role: 'button',
            onMouseDown: (e) => { e.preventDefault(); e.stopPropagation(); openPreview(entry) },
            onClick: (e) => { e.stopPropagation() },
          }, eyeSvg) : null,
          !isDir ? el('span', { className: 'dshwe-insert', title: tr('insert.tip') }, insertSvg) : null,
        )
      }

      const renderTree = (rel, depth) => {
        const data = dirs[rel]
        if (!data) return []
        const rows = []
        for (const entry of data.entries) {
          const isDir = entry.type === 'directory'
          const isExp = isDir && !!expanded[entry.rel]
          rows.push(rowFor(entry, depth, isExp))
          if (isExp) rows.push(...renderTree(entry.rel, depth + 1))
        }
        if (data.truncated) rows.push(el('div', { key: 'trunc', className: 'dshwe-note' }, tr('truncated', { n: data.entries.length })))
        if (data.loading) rows.push(el('div', { key: 'load', className: 'dshwe-note' }, el('span', { className: 'dshwe-spin' }), tr('loading')))
        if (data.error) rows.push(el('div', { key: 'err', className: 'dshwe-note dshwe-note-err' }, tr('load.fail') + data.error))
        return rows
      }

      const options = []
      if (cwd) options.push({ value: cwd, label: tr('ws.current') + ' · ' + basename(cwd) })
      for (const w of workspaces) options.push({ value: w.path, label: w.title + ' · ' + w.path })
      const seen = new Set()
      const uniqOptions = options.filter((o) => { if (seen.has(o.value)) return false; seen.add(o.value); return true })

      const rootLabel = root ? basename(root) : ''
      let body
      if (q !== '') {
        const hits = []
        collectMatches('', 0, hits)
        const hitRows = hits.length
          ? hits.map((h) => rowFor(h.entry, 0, false))
          : el('div', { className: 'dshwe-empty' }, tr('hit.none', { q: filter }))
        body = [el('div', { key: 'hit-note', className: 'dshwe-note' }, tr('hit', { n: hits.length })), hitRows]
      } else if (wsState.state === 'loading' && (workspaces.length === 0)) {
        body = el('div', { className: 'dshwe-empty' },
          el('div', { className: 'dshwe-note' }, el('span', { className: 'dshwe-spin' }), tr('loading.ws')))
      } else if (root === null) {
        body = el('div', { className: 'dshwe-empty' },
          el('div', { className: 'dshwe-empty-ico' }, headFolderSvg),
          el('div', null, tr('empty.title')),
          el('button', { type: 'button', className: 'dshwe-addbtn', onClick: addWorkspace }, tr('empty.add')),
        )
      } else {
        body = renderTree('', 0)
      }

      let pv = null
      if (preview) {
        const d = preview.data
        let contentArea
        if (preview.loading) {
          contentArea = el('div', { className: 'dshwe-note' }, el('span', { className: 'dshwe-spin' }), tr('read'))
        } else if (preview.error) {
          contentArea = el('div', { className: 'dshwe-note dshwe-note-err' }, tr('read.fail') + preview.error)
        } else if (d.tooLarge) {
          contentArea = el('div', { className: 'dshwe-note' }, tr('too.large', { s: fmtSize(d.size) }))
        } else if (d.binary) {
          contentArea = el('div', { className: 'dshwe-note' }, tr('binary'))
        } else {
          contentArea = el('pre', { className: 'dshwe-preview-pre' }, d.content + (d.truncatedLines ? '\n' + tr('lines.tail', { n: d.lineCount }) : ''))
        }
        const canInline = !preview.loading && !preview.error && d && !d.tooLarge && !d.binary && d.size <= 32768
        pv = el('div', { className: 'dshwe-preview' },
          el('div', { className: 'dshwe-preview-head' },
            el('div', { className: 'dshwe-preview-name' }, preview.entry.name),
            el('div', { className: 'dshwe-preview-meta' }, preview.entry.size != null ? fmtSize(preview.entry.size) : ''),
            el('button', { type: 'button', className: 'dshwe-icobtn', onClick: () => setPreview(null), title: tr('close.preview'), 'aria-label': tr('close.preview') },
              el('svg', { viewBox: '0 0 16 16', width: 13, height: 13, 'aria-hidden': true },
                el('path', { d: 'M4 4l8 8M12 4l-8 8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }))),
          ),
          contentArea,
          el('div', { className: 'dshwe-preview-actions' },
            el('button', { type: 'button', className: 'dshwe-prevbtn', onClick: () => insertMarker(preview.entry) }, tr('btn.ref')),
            el('button', { type: 'button', className: 'dshwe-prevbtn primary', disabled: !canInline, title: canInline ? tr('btn.content.tip') : tr('btn.content.no'), onClick: insertContent }, tr('btn.content')),
          ),
        )
      }

      return el('div', { className: 'dshwe-panel' },
        el('div', { className: 'dshwe-head' },
          el('span', { className: 'dshwe-head-ico' }, headFolderSvg),
          el('div', { className: 'dshwe-title' }, tr('panel.title') + (rootLabel ? ' · ' + rootLabel : '')),
          el('button', { type: 'button', className: 'dshwe-icobtn', onClick: refresh, title: tr('refresh'), 'aria-label': tr('refresh') },
            el('svg', { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true },
              el('path', { d: 'M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }))),
          el('button', { type: 'button', className: 'dshwe-icobtn', onClick: () => setOpen(false), title: tr('close'), 'aria-label': tr('close') },
            el('svg', { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true },
              el('path', { d: 'M4 4l8 8M12 4l-8 8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }))),
        ),
        el('div', { className: 'dshwe-selrow' },
          el('select', { className: 'dshwe-sel', value: root || '', onChange: (e) => setRoot(e.target.value) },
            uniqOptions.map((o) => el('option', { key: o.value, value: o.value }, o.label))),
          el('button', { type: 'button', className: 'dshwe-addbtn', onClick: addWorkspace, title: tr('add.ws') }, '+'),
        ),
        el('div', { className: 'dshwe-filterrow' },
          el('input', {
            className: 'dshwe-filter', type: 'text', value: filter, placeholder: tr('search.ph'),
            onChange: (e) => setFilter(e.target.value),
          }),
          filter !== '' ? el('button', { type: 'button', className: 'dshwe-filter-clear', onClick: () => setFilter(''), title: tr('close'), 'aria-label': tr('close') },
            el('svg', { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': true },
              el('path', { d: 'M4 4l8 8M12 4l-8 8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }))) : null,
        ),
        el('div', { className: 'dshwe-hintline' }, el('span', null, '↩'), tr('hint')),
        el('div', { className: 'dshwe-tree' }, body),
        pv,
      )
    }

    // ---- 浮层入口：右侧面板 + 全屏拖拽提示 + 拖放处理 ----
    function OverlayEntry(props) {
      const [on, setOn] = React.useState(getOpen())
      const [dragging, setDragging] = React.useState(false)
      React.useEffect(() => subscribeOpen(setOn), [])

      React.useEffect(() => {
        const hasMarker = (e) => e.dataTransfer != null && Array.from(e.dataTransfer.types || []).indexOf(MARKER) >= 0
        const onDragOver = (e) => {
          if (!hasMarker(e)) return
          e.preventDefault()
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
        }
        const onDrop = (e) => {
          if (!hasMarker(e)) return
          const dt = e.dataTransfer
          const markerText = dt ? dt.getData('text/plain') : ''
          const target = e.target instanceof HTMLElement ? e.target : null
          const ta = target ? target.closest('[data-composer-card] textarea') : null
          if (ta != null) {
            setDragging(false)
            return
          }
          e.preventDefault()
          e.stopPropagation()
          setDragging(false)
          if (markerText !== '') {
            const b = getBridge()
            if (b) b.insert(markerText)
          }
        }
        const onDragEnd = () => setDragging(false)
        document.addEventListener('dragover', onDragOver, true)
        document.addEventListener('drop', onDrop, true)
        document.addEventListener('dragend', onDragEnd)
        return () => {
          document.removeEventListener('dragover', onDragOver, true)
          document.removeEventListener('drop', onDrop, true)
          document.removeEventListener('dragend', onDragEnd)
        }
      }, [])

      return el('div', { className: 'dshwe-layer' },
        dragging ? el('div', { className: 'dshwe-hint' }, el('div', { className: 'dshwe-hint-chip' }, dropSvg, tr('drop.hint'))) : null,
        on ? el(Panel, { ...props, onDraggingChange: setDragging }) : null,
      )
    }

    slots.inject('sidebar.footer.action', () => slots.register(
      { name: 'sidebar.footer.action', id: 'workspace-explorer' },
      (props) => el(SidebarAction, props),
    ))
    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'workspace-explorer-panel' },
      (props) => el(OverlayEntry, props),
    ))
    slots.inject('conversation.input.dock', () => slots.register(
      { name: 'conversation.input.dock', id: 'workspace-explorer-bridge' },
      (props) => el(DockBridge, props),
    ))
  },
}
