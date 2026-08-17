# Changelog

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
