# dsh-workspace-explorer

[English](README.md) | **中文**

> 给 DeepSeek Harness Web UI 的工作区文件资源管理器:右侧面板展示当前工作区目录树,点击或拖拽文件即可把文件引用发给大模型。

灵感来自 VS Code / Cursor 的项目目录树,弥补 DSH 添加工作台后没有目录视图的空白。

## 🖥 在线预览(GitHub Pages)

🔗 [**试试交互式预览**](https://Jiyr0119.github.io/dsh-workspace-explorer/)

> 这是面板 UI 的交互式**模拟预览**,无需安装 DeepSeek Harness 即可体验。真实插件运行在 Harness Web UI 内(动态 Cordis 插件)。

## 功能特性

- 📂 **右侧浮层面板** — 展示当前工作区(会话 cwd)的目录文件树;顶部下拉可切换其他工作区,或用 `+` 选择文件夹注册为新工作区
- 🗂 **懒加载展开** — 目录按需加载,自动隐藏 `node_modules` / `.git` / `dist` / `__pycache__` 等噪声目录
- 🎨 **文件类型图标** — 按扩展名着色的实心文档徽标(TS / JS / Python / JSON / Markdown / 图片 / 配置 / 脚本等),目录为琥珀色文件夹、展开态高亮
- 🖱 **点击插入** — 点击文件行,在输入框末尾追加 `[file: 相对路径]` 引用,发送后模型会用 `read` 读取真实内容
- 🖱 **拖拽插入** — 拖到输入框内任意位置在光标处插入(带全屏虚线提示);拖到其他位置则追加到末尾
- 🌓 **跟随主题** — 全部使用 DSH 的 `--dsw-alias-*` 设计 token,浅色/深色自动适配;原生弹窗外观(24px 圆角、lv3 阴影、l3 头部分隔线)

## 快速开始

### 安装

这是**动态 Cordis 插件**形态,无需构建、无需改任何配置文件。

1. 在 DSH Web UI 中让 Agent 执行 `cordis_define`(或使用动态插件面板),`idPrefix` 填 `wsex`
2. 将 [`src/host.js`](./src/host.js) 全文粘贴到 **Host 代码**
3. 将 [`src/client.js`](./src/client.js) 全文粘贴到 **Client 代码**
4. `cordis_run` 激活,首次出现 Run 卡时点击授权

详细步骤见 [`docs/install.md`](./docs/install.md)。

### 使用

1. 点击侧边栏底部的 📁「文件」按钮打开面板
2. 展开目录浏览文件
3. 点击文件,或把它拖进聊天输入框,然后发送

## 目录结构

```
dsh-workspace-explorer/
├── README.md             # 文档 — English(默认)
├── README.zh.md          # 文档 — 中文
├── LICENSE               # MIT
├── CHANGELOG.md          # 变更记录
├── manifest.json         # 插件元信息
├── package.json          # 仓库元信息(非 npm 包)
├── demo/
│   └── index.html        # 交互式模拟预览(GitHub Pages)
├── .github/
│   └── workflows/
│       └── pages.yml     # 部署 demo/ 到 GitHub Pages
├── docs/
│   ├── install.md        # 安装与转原生包指南
│   └── publish.md        # 发布流程
└── src/
    ├── host.js           # Host 半区:fs 列目录 + ws-tree.list RPC
    └── client.js         # Client 半区:面板 + 图标 + 拖拽
```

## 实现要点

| 能力 | 机制 |
|---|---|
| 目录读取 | Host `fs.resolve` / `fs.listDir` |
| Host→Client 通信 | `harness.handle('ws-tree.list')` ↔ `host.call(...)` |
| 右侧面板 | `shell.overlay` 槽位(`useWorkspaces` / `useSessions`) |
| 开关按钮 | `sidebar.footer.action` 槽位 |
| 写入输入框 | `conversation.input.dock` → `inputActions.setDraft` |
| 拖拽插入 | HTML5 DnD;输入框内走原生光标插入,其他位置追加 |
| 主题适配 | `--dsw-alias-*` CSS 变量(浅/深色自动) |

## 版本

当前版本 **v0.1** — 首个可用版本,功能与视觉对齐 DSH 原生 UI。
变更记录见 [CHANGELOG.md](./CHANGELOG.md)。

## Roadmap

- [ ] 小文件拖入可选「内联内容」(类 ChatGPT 上传)
- [ ] 文件名搜索 / 过滤
- [ ] 文件预览(前 N 行)
- [ ] 转成原生 DSH 包(`@Remote` 命名空间)— 见 [`docs/install.md`](./docs/install.md)

## License

[MIT](./LICENSE)
