# Changelog

## [v0.5.1] - 2026-08-17

### 入口升级 Entry pill

- **会话头部入口改为「功能名称 + 图标」胶囊**,与 DSH 原生 **Session log 下载按钮**同款样式(描边圆角胶囊、名称在左、文件夹图标在右,高亮主题色):会话头部入口从纯图标按钮升级为「工作区文件 / Workspace Files」胶囊,打开面板时胶囊呈激活态 / The session-header entry is now a **feature-name + icon capsule** matching the native **Session log** download button (bordered pill, label left, folder icon right, business-primary active state): the entry reads "工作区文件 / Workspace Files" and lights up while the panel is open.
- 原生包(`src/client/index.tsx` + `lib/client.js`)与动态粘贴版(`dynamic/client.js`)同步更新;新增 `drawer.label` 词典键(zh/en) / Both the native bundle and the dynamic paste-in client were updated in sync; a new `drawer.label` locale key (zh/en) drives the button text.
- 演示页与 GIF 重录:`demo/index.html` 重构为与当前产品一致的模拟(会话头部胶囊入口 + Tab 栏 + 多选操作条 + 目录拖拽目录树 + 分页预览 + 设置页),`demo/preview.gif` 重新录制展示新入口与 M1 特性 / The interactive demo and GIF were rebuilt: `demo/index.html` now mirrors the current product (header pill entry, tabs, selection bar, folder-drag tree text, paginated preview, settings), and `demo/preview.gif` was re-recorded to show the new entry and the M1 read-path features.

## [v0.5.0] - 2026-08-17

### 里程碑 M1 — 读路径体验 Read-path UX

- **多选批量插入** — Shift 点击扩展选择区间、⌘/Ctrl 点击切换选择,选中后底部操作条一键插入:文件 → `[file: 路径]` 引用,目录 → 目录树文本 / **Multi-select & batch insert** — Shift extends the selection range, ⌘/Ctrl toggles; a bottom action bar batch-inserts files as references and folders as compact tree listings.
- **目录拖拽** — 目录行现在也可拖拽:落点处异步生成**限层数(默认 3 层)的紧凑目录树文本**(`name/` + `├──` 树形,噪声目录过滤、200 条上限),拖入输入框内同样拦截替换为树文本 / **Folder drag & drop** — folders are draggable; on drop the client fetches a depth-limited compact tree listing and inserts it, including drops inside the composer.
- **分页全量预览** — 预览不再截断在 60 行 / 200KB:上一页 / 下一页按行翻页(每页行数跟随「预览行数」设置),显示总行数与当前页;「插入内容」对小文件(≤32KB)改为整文件取回 / **Paginated full preview** — prev/next paging through the whole file (page size follows the "preview lines" setting) replaces the 60-line / 200 KB cap; "insert content" fetches the entire ≤32 KB file.

### Host

- `/dsh-we/api/peek` 支持 `offset` / `limit` / `whole`:小文件(≤4MB)整读、行数精确;大文件块扫描定位行区间(行数未知);二进制前 8KB 嗅探 / peek now takes offset/limit/whole; ≤4 MB files read whole for exact line counts, larger files page-scanned in chunks, binary sniffed on the first 8 KB.
- 新增 `/dsh-we/api/tree`:递归收集目录树节点(深度 ≤6、条目预算 ≤200 默认,噪声目录过滤)/ New `/dsh-we/api/tree` route: recursive tree nodes with depth/entry budgets.
- 动态版同步:新增 `ws-tree.tree` RPC;`ws-tree.peek` 支持 offset/limit/whole(动态备用路径无 offset 读取,>8MB 文件走 tooLarge 优雅降级)/ Dynamic host synced: new `ws-tree.tree` RPC; peek supports paging (the paste-in backup path pages within 8 MB, degrades gracefully beyond).

### 修复 Fix

- **构建顺序修复**:`npm run build` 改为 `tsdown && tsc -p tsconfig.build.json`——此前 tsc 先输出 `lib/types` 再被 tsdown 的 clean 清掉,导致包里 `exports.types` 悬空(TS 用户装包后类型引用报错)/ **Build-order fix**: build now runs `tsdown && tsc -p tsconfig.build.json` — previously tsc emitted `lib/types` and tsdown's clean then wiped it, leaving dangling `exports.types` for TS consumers.
- 动态 host:`fs.readText` 返回 string,去掉多余的 TextDecoder 解码(此前抛 "The list argument must be …")/ Dynamic host no longer TextDecoder-decodes `fs.readText` strings (it previously threw).
- 全链路公开链接统一为小写规范域名 `jiyr0119.github.io`(与 GitHub Pages canonical `html_url` 一致)/ All public links normalized to the lowercase canonical `jiyr0119.github.io`.
- **交互式预览已隐藏**:README 移除在线预览链接与 Pages 徽章,Pages 工作流改为仅手动触发;npm homepage 改指 GitHub 仓库 / **Interactive preview hidden**: the online preview link and the Pages badge were removed from the READMEs, the Pages workflow now runs manually only, and the npm homepage points at the GitHub repo.

## [v0.4.0] - 2026-08-17

### 交互重构 Interaction overhaul (popup + file-tree entry)

- 面板从「details 列抽屉」改为**浮动弹窗**:由会话头部(与 session log 同排)的**文件树图标**打开,带淡入/缩放展开动画 / Panel is now a **floating popup** opened by a **file-tree icon** in the session header (beside the session log), with a fade/scale-in animation.
- **弹窗位置实时测量**:位于会话头部底部与输入框(composer)顶部之间,绝不遮挡输入框;窗口缩放、header/composer 布局变化时自动跟随 / **Live-measured position** between the session header and the composer; follows window & layout changes automatically.
- 移除 `sidebar.footer.action` 侧边栏按钮(以空占位注册顶掉旧版原生包残留按钮),唯一入口为会话头部图标 / The sidebar footer button was removed (placeholder registration supersedes the legacy native bundle's button); the session-header icon is the single entry.
- 不再依赖壳的 `layout.openDetails/closeDetails` 与 details 列,避免抢占壳的「工具调用详情」功能 / No longer drives the shell's details column (`layout.openDetails/closeDetails`), so the shell's tool-details panel stays untouched.

### 修复 Fix

- 保留 v0.3.2 的 `webServer.register` 逐条注册修复与 v0.3.1 的 `cordis.patch.yml` 引号修复(原生安装路径) / Kept the v0.3.2 per-route `webServer.register` fix and the v0.3.1 quoted `cordis.patch.yml` fix (native install path).
- `DockBridge` 对 `useInput` 空值守卫,避免输入桥崩溃 / `DockBridge` guards a missing `useInput` prop.
- 弹窗动画尊重 `prefers-reduced-motion` / Popup animation respects `prefers-reduced-motion`.

## [v0.3.2] - 2026-08-17

### 修复 Fix

- **`webServer.register` 传数组导致路由全部静默失效**:真实 `register()` 只接受单个 route,数组被塞进前缀表(key=undefined),`/dsh-we/api/list|peek|config` 全部未注册 → 浏览器 `fetch().json()` 报 `Unexpected end of JSON input`。改为逐条注册(用真实 WebServer 服务验证:三路由全部注册 + list/config/peek 正常)/ `register()` was called with an array, which silently no-oped (routes never registered → empty responses). Now registered one by one and verified against the real WebServer service.

### 交互 Interaction

- 面板改为**右上角 dock 式侧边面板**(对标 dsh-web-ui 右侧面板):贴顶吸边、左边框 + 左阴影、左下圆角;左边缘 6px 拖把可拖宽(280–640px)/ Panel is now a **top-right docked side panel** (dsh-web-ui style): flush to the top-right corner, left edge + shadow, drag handle to resize (280–640px).

## [v0.3.1] - 2026-08-17

### 修复 Fix

- **`cordis.patch.yml` YAML 语法错误**:`name` 的作用域包名未加引号(`@` 不能作为 YAML 裸标量起始字符),导致 `dsh web` 启动解析补丁时报 `bad indentation of a mapping entry` 崩溃。已加引号并对齐官方格式 / Unquoted `@`-scoped package name in `cordis.patch.yml` broke `dsh web` boot; value is now quoted to match the official bundle patches.

## [v0.3.0] - 2026-08-17

### 交互改造 Interaction overhaul (dsh-better-sidebar style)

- 面板**顶部 Tab 栏**(文件 / 设置),点击顶部切换页面 / Top **tab bar** (Files / Settings) at the top of the panel.
- **设置页**逐项开关/下拉,实时生效:隐藏噪声目录、显示文件大小、引用格式(相对/绝对)、预览行数、面板宽度 / **Settings page** with live toggles & selects: hide noise dirs, show sizes, reference format, preview lines, panel width.
- 设置同步进 DSH 设置壳(`设置 → 工作区文件`)/ Settings also mirrored into the DSH Settings shell (Settings → Workspace Explorer).
- Host 新增 `ws-tree.config` RPC(动态版)与 `/dsh-we/api/config` 路由(原生版):噪声目录 / 预览行数可调 / New `ws-tree.config` RPC (dynamic) and `/dsh-we/api/config` route (native): noise dirs / preview lines tunable.
- **原生包同步新交互**:`src/client/index.tsx` 重写为顶部 Tab + 设置页,`lib/index.js` + `lib/client.js` 重建(56KB)/ Native bundle rebuilt with the new interaction.

## [v0.2.0] - 2026-08-17

### 原生化 Native package

- 重构为**原生单包**(仿 dsh-better-sidebar 模板):Host `src/index.ts`(webServer JSON 路由 `/dsh-we/api/list` + `/peek`)+ 浏览器 bundle `src/client/index.tsx`(`dsh.plugin.json` client.main,`__ModuleLoader__` 格式)
- 构建产物:`lib/index.js`(ESM host)+ `lib/client.js`(CJS browser,42KB)+ `lib/types`
- 动态版保留至 `dynamic/host.js` + `dynamic/client.js`(零构建粘贴路径)
- `dsh plugin --profile web add @jiyr0119/dsh-workspace-explorer@latest` 后浏览器面板可挂载(真实 DSH 挂载验证待完成)

## [v0.1.1] - 2026-08-17

### 新增 Added

- GitHub Pages 交互式预览 `demo/index.html`(面板打开时聊天区自动让位)/ Interactive GitHub Pages preview (`demo/index.html`; the chat area yields to the panel when opened).
- 演示 GIF `demo/preview.gif`,内嵌于两份 README / Demo GIF embedded in both READMEs.
- npm 可发布源码包 `@jiyr0119/dsh-workspace-explorer` / npm-publishable source package.
- 原生 DSH 包路线文档 `docs/native-package.md` / Native-package roadmap doc.
- 市场截图素材 `assets/screenshots/` / Storefront screenshot assets.
- 文件名搜索过滤(平铺结果 + 匹配计数)/ Filename search & filter (flat results + match count).
- 文件预览(前 60 行)与小文件内联插入(≤32KB)/ Inline preview (first 60 lines) + content insertion for small files (≤ 32 KB).
- 国际化:zh/en 词典,面板跟随 DSH 界面语言 / i18n: zh/en dictionaries via the DSH locale service, follows the DSH UI language.
- 预览/插入图标 hover 小手光标;面板顶部锚定限高,不遮挡底部输入框 / Pointer cursor on preview/insert icons; panel top-anchored with bounded height so the composer stays visible.
- 演示页支持中英切换 / Demo page language toggle (zh/en).
- `dsh.bundle` 可安装契约(`cordis.patch.yml` + `index.js`)/ `dsh.bundle` installability contract.

### 变更 Changed

- README 改为英文默认 + 中英切换(`README.md` / `README.zh.md`)/ READMEs restructured: English default with a language switch.
- 仓库迁移至 `~/workspaceforme` 根目录 / Repo moved to `~/workspaceforme`.

## [v0.1.0] - 2025-08-14

首个正式版本 / First official release。

### 功能 Features

- 右侧浮层面板展示工作区目录文件树,顶部可切换/添加工作区
  Right-side panel with the workspace file tree; switch or add workspaces from the top bar.
- 目录懒加载展开,自动隐藏 `node_modules` / `.git` / `dist` 等噪声目录
  Lazy-loading directories; noise dirs (`node_modules`, `.git`, `dist`, …) hidden automatically.
- 按扩展名着色的实心文件类型图标(TS / JS / Python / JSON / Markdown / 图片 / 配置 / 脚本等)
  Filled, color-coded file-type icons per extension (TS / JS / Python / JSON / Markdown / image / config / shell, …).
- 点击或拖拽文件,把 `[file: 路径]` 引用插入聊天输入框(拖入输入框内走原生光标插入)
  Click or drag a file to insert a `[file: path]` reference into the composer (native caret insert when dropped inside the textarea).
- 侧边栏底部「文件」开关按钮
  Sidebar footer "Files" toggle button.
- 视觉对齐 DSH 原生 UI:全部使用 `--dsw-alias-*` 设计 token,浅/深色自适应,24px 圆角 + lv3 阴影 + l3 头部分隔线
  Visuals aligned with DSH native UI: built on `--dsw-alias-*` design tokens, light/dark adaptive, 24px radius + lv3 shadow + l3 header rule.

### 修复与边界 Fixes & Edge Cases

- 根目录列表(`rel=''`)不再误报 `bad-rel`
  Root listings (`rel=''`) no longer trip the `bad-rel` validation.
- RPC 参数全部为纯字符串,规避 `host.call` 对非 JSON 值的拒绝
  RPC args are plain strings, avoiding `host.call` rejection of non-JSON values.
- 拖放:输入框内原生插入(光标精确),其他位置追加;拖拽提示尊重 `prefers-reduced-motion`
  Drag & drop: native caret insert inside the composer, append elsewhere; the drag hint respects `prefers-reduced-motion`.
