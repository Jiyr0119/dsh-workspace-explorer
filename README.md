# dsh-workspace-explorer

> 给 DeepSeek Harness Web UI 的工作区文件资源管理器:右侧面板展示当前工作区目录树,点击或拖拽文件即可把文件引用发给大模型。
> A workspace file explorer for the DeepSeek Harness Web UI: a right-side panel showing the current workspace's directory tree — click or drag a file to send its reference to the model.

灵感来自 VS Code / Cursor 的项目目录树,弥补 DSH 添加工作台后没有目录视图的空白。
Inspired by the VS Code / Cursor project tree — filling the gap of a missing directory view in DSH after workspaces are added.

## 功能特性 Features

### 中文

- 📂 **右侧浮层面板** — 展示当前工作区(会话 cwd)的目录文件树;顶部下拉可切换其他工作区,或用 `+` 选择文件夹注册为新工作区
- 🗂 **懒加载展开** — 目录按需加载,自动隐藏 `node_modules` / `.git` / `dist` / `__pycache__` 等噪声目录
- 🎨 **文件类型图标** — 按扩展名着色的实心文档徽标(TS / JS / Python / JSON / Markdown / 图片 / 配置 / 脚本等),目录为琥珀色文件夹、展开态高亮
- 🖱 **点击插入** — 点击文件行,在输入框末尾追加 `[file: 相对路径]` 引用,发送后模型会用 `read` 读取真实内容
- 🖱 **拖拽插入** — 拖到输入框内任意位置在光标处插入(带全屏虚线提示);拖到其他位置则追加到末尾
- 🌓 **跟随主题** — 全部使用 DSH 的 `--dsw-alias-*` 设计 token,浅色/深色自动适配;原生弹窗外观(24px 圆角、lv3 阴影、l3 头部分隔线)

### English

- 📂 **Right-side floating panel** — Shows the file tree of the current workspace (session cwd); the dropdown at the top switches between workspaces, and `+` registers any folder as a new workspace
- 🗂 **Lazy-loading tree** — Directories load on demand; noise directories (`node_modules`, `.git`, `dist`, `__pycache__`, …) are hidden automatically
- 🎨 **File-type icons** — Filled, color-coded document badges per extension (TS / JS / Python / JSON / Markdown / image / config / shell, …); directories use amber folders that brighten when expanded
- 🖱 **Click to insert** — Click a file row to append a `[file: relative-path]` reference to the composer; after sending, the model resolves it with its `read` tool
- 🖱 **Drag & drop** — Drop a file anywhere in the composer to insert at the caret (with a fullscreen dashed hint); dropping elsewhere appends to the end
- 🌓 **Theme-aware** — Built entirely on DSH's `--dsw-alias-*` design tokens; adapts to light/dark automatically with a native dialog look (24px radius, lv3 shadow, l3 header rule)

## 快速开始 Quick Start

### 安装 Installation

这是**动态 Cordis 插件**形态,无需构建、无需改任何配置文件。
This is a **dynamic Cordis plugin** — no build step, no config file changes.

1. 在 DSH Web UI 中让 Agent 执行 `cordis_define`(或使用动态插件面板),`idPrefix` 填 `wsex`
   In DSH Web UI, have an agent run `cordis_define` (or use the dynamic plugin panel) with `idPrefix` `wsex`.
2. 将 [`src/host.js`](./src/host.js) 全文粘贴到 **Host 代码**
   Paste the whole [`src/host.js`](./src/host.js) into **Host code**.
3. 将 [`src/client.js`](./src/client.js) 全文粘贴到 **Client 代码**
   Paste the whole [`src/client.js`](./src/client.js) into **Client code**.
4. `cordis_run` 激活,首次出现 Run 卡时点击授权
   Run via `cordis_run` and authorize on the Run card when it first appears.

详细步骤见 [docs/install.md](./docs/install.md)。详见 [docs/install.md](./docs/install.md) for details.

### 使用 Usage

1. 点击侧边栏底部的 📁「文件」按钮打开面板
   Click the 📁 "Files" button at the bottom of the sidebar to open the panel.
2. 展开目录浏览文件
   Expand directories to browse files.
3. 点击文件,或把它拖进聊天输入框,然后发送
   Click a file, or drag it into the composer, then send.

## 目录结构 Project Structure

```
dsh-workspace-explorer/
├── README.md            # 项目说明(中英双语)/ Project docs (bilingual)
├── LICENSE              # MIT
├── CHANGELOG.md         # 变更记录 / Release notes
├── manifest.json        # 插件元信息 / Plugin metadata
├── package.json         # 仓库元信息(非 npm 包)/ Repo metadata (not an npm package)
├── docs/
│   ├── install.md       # 安装与转原生包 / Install & native-package guide
│   └── publish.md       # GitHub 发布流程 / Publishing workflow
└── src/
    ├── host.js          # Host 半区:fs 列目录 + ws-tree.list RPC
    └── client.js        # Client 半区:面板 + 图标 + 拖拽
```

## 实现要点 Implementation Notes

| 能力 Capability | 机制 Mechanism |
|---|---|
| 目录读取 Directory listing | Host `fs.resolve` / `fs.listDir` |
| Host→Client 通信 RPC | `harness.handle('ws-tree.list')` ↔ `host.call(...)` |
| 右侧面板 Panel | `shell.overlay` 槽位 / slot(`useWorkspaces` / `useSessions`) |
| 开关按钮 Toggle button | `sidebar.footer.action` 槽位 / slot |
| 写入输入框 Composer write | `conversation.input.dock` → `inputActions.setDraft` |
| 拖拽插入 Drag & drop | HTML5 DnD;输入框内走原生光标插入,其他位置追加 / native caret insert in the textarea, append elsewhere |
| 主题适配 Theming | `--dsw-alias-*` CSS 变量(浅/深色自动)/ CSS variables (light/dark) |

## 版本 Version

当前版本 **v0.1** — 首个可用版本,功能与视觉对齐 DSH 原生 UI。
Current version **v0.1** — first usable release; features and visuals aligned with DSH's native UI.
变更记录见 [CHANGELOG.md](./CHANGELOG.md)。See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Roadmap

- [ ] 小文件拖入可选「内联内容」(类 ChatGPT 上传)/ optional inline content for small files
- [ ] 文件名搜索 / 过滤 / filename search & filter
- [ ] 文件预览(前 N 行)/ file preview (first N lines)
- [ ] 转成原生 DSH 包(`@Remote` 命名空间)/ native DSH package (`@Remote` namespace) — 见 [docs/install.md](./docs/install.md)

## License

[MIT](./LICENSE)
