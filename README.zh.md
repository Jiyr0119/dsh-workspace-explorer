# dsh-workspace-explorer

[English](README.md) | **中文**

[![License](https://img.shields.io/github/license/Jiyr0119/dsh-workspace-explorer)](LICENSE)
[![Pages](https://img.shields.io/github/actions/workflow/status/Jiyr0119/dsh-workspace-explorer/pages.yml?label=pages%20deploy)](https://Jiyr0119.github.io/dsh-workspace-explorer/)
[![Last commit](https://img.shields.io/github/last-commit/Jiyr0119/dsh-workspace-explorer)](https://github.com/Jiyr0119/dsh-workspace-explorer)

> 给 DeepSeek Harness Web UI 的工作区文件资源管理器:右侧面板展示当前工作区目录树,点击或拖拽文件即可把文件引用发给大模型。

灵感来自 VS Code / Cursor 的项目目录树,弥补 DSH 添加工作台后没有目录视图的空白。

## 🖥 在线预览(GitHub Pages)

🔗 [**试试交互式预览**](https://Jiyr0119.github.io/dsh-workspace-explorer/)

> 这是面板 UI 的交互式**模拟预览**,无需安装 DeepSeek Harness 即可体验。真实插件运行在 Harness Web UI 内(动态 Cordis 插件)。

![dsh-workspace-explorer 演示](demo/preview.gif)

<details>
<summary><b>截图</b> Screenshots</summary>

![面板](assets/screenshots/panel.png)

![目录树](assets/screenshots/tree.png)

![插入并发送](assets/screenshots/insert.png)

</details>

## 功能特性

- 📂 **右侧浮层面板** — 展示当前工作区(会话 cwd)的目录文件树;顶部下拉可切换其他工作区,或用 `+` 选择文件夹注册为新工作区
- 🗂 **懒加载展开** — 目录按需加载,自动隐藏 `node_modules` / `.git` / `dist` / `__pycache__` 等噪声目录
- 🎨 **文件类型图标** — 按扩展名着色的实心文档徽标(TS / JS / Python / JSON / Markdown / 图片 / 配置 / 脚本等),目录为琥珀色文件夹、展开态高亮
- 🖱 **点击插入** — 点击文件行,在输入框末尾追加 `[file: 相对路径]` 引用,发送后模型会用 `read` 读取真实内容
- 🖱 **拖拽插入** — 拖到输入框内任意位置在光标处插入(带全屏虚线提示);拖到其他位置则追加到末尾
- 🌓 **跟随主题** — 全部使用 DSH 的 `--dsw-alias-*` 设计 token,浅色/深色自动适配;原生弹窗外观(24px 圆角、lv3 阴影、l3 头部分隔线)
- 🔍 **搜索过滤** — 按文件名过滤已加载目录,平铺展示结果并显示匹配数
- 👁 **文件预览** — 预览任意文本文件前 60 行;可插入引用,小文件(≤32KB)可直接插入完整内容
- 🌐 **国际化** — 通过 DSH locale 服务注册中/英词典,面板跟随 DSH 界面语言切换

## 快速开始

### 安装

这是**动态 Cordis 插件**形态,无需构建、无需改任何配置文件。

1. 在 DSH Web UI 中让 Agent 执行 `cordis_define`(或使用动态插件面板),`idPrefix` 填 `wsex`
2. 将 [`src/host.js`](./src/host.js) 全文粘贴到 **Host 代码**
3. 将 [`src/client.js`](./src/client.js) 全文粘贴到 **Client 代码**
4. `cordis_run` 激活,首次出现 Run 卡时点击授权

**npm 安装(源码分发)**:`npm install @jiyr0119/dsh-workspace-explorer` — 包内含 `src/host.js` / `src/client.js`,按上面流程粘贴即可,版本随 semver 发布(非原生 Remote 挂载,原生包路线见 [`docs/native-package.md`](./docs/native-package.md))。

> 可安装性说明:仓库已声明 `dsh.bundle` 清单(`cordis.patch.yml` + `index.js`)以满足插件市场收录门槛;完整可交互 UI 当前仍是上面的动态插件形态 —— 通过 `dsh plugin add` 让 UI 生效需要上游 Remote 支持(见 [`docs/native-package.md`](./docs/native-package.md))。

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
│   ├── index.html        # 交互式模拟预览(GitHub Pages)
│   └── preview.gif       # 演示动图(README)
├── .github/
│   └── workflows/
│       └── pages.yml     # 部署 demo/ 到 GitHub Pages
├── docs/
│   ├── install.md        # 安装指南
│   ├── native-package.md # 原生 DSH 包路线(上游 PR 草图)
│   └── publish.md        # 发布流程(GitHub + npm)
└── src/
    ├── host.js           # Host 半区:fs 列目录 + ws-tree.list RPC
    └── client.js         # Client 半区:面板 + 图标 + 拖拽
```

## 实现要点

| 能力 | 机制 |
|---|---|
| 目录读取 | Host `fs.resolve` / `fs.listDir` |
| Host→Client 通信 | `harness.handle('ws-tree.list' / 'ws-tree.peek')` ↔ `host.call(...)` |
| 右侧面板 | `shell.overlay` 槽位(`useWorkspaces` / `useSessions`) |
| 开关按钮 | `sidebar.footer.action` 槽位 |
| 写入输入框 | `conversation.input.dock` → `inputActions.setDraft` |
| 拖拽插入 | HTML5 DnD;输入框内走原生光标插入,其他位置追加 |
| 主题适配 | `--dsw-alias-*` CSS 变量(浅/深色自动) |

## 版本

当前版本 **v0.1** — 首个可用版本,功能与视觉对齐 DSH 原生 UI。
变更记录见 [CHANGELOG.md](./CHANGELOG.md)。

## Roadmap

**已完成 ✅**

- [x] v0.1 核心:右侧文件树、点击/拖拽插入引用、DSH 原生观感
- [x] 搜索过滤;内联预览(前 60 行);小文件(≤32KB)内容插入
- [x] 国际化(zh/en,跟随 DSH 界面语言)
- [x] 演示页中英切换、GitHub Pages 预览、演示 GIF、市场截图素材
- [x] npm 源码包 + `dsh.bundle` 契约 + awesome 列表 PR([#1158](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/1158),待合并)

**线路 A — 体验完善**

- [ ] 多选批量插入文件引用(Shift / Cmd)
- [ ] 面板可拖动/可调宽,记住位置与宽度
- [ ] 完整键盘导航(↑↓ 选择、Enter 插入、Esc 关闭)
- [ ] 路径操作:复制路径、在系统文件管理器中显示

**线路 B — 生产力**

- [ ] 跨已加载目录的内容搜索(host 侧 grep)
- [ ] 最近文件 / 收藏夹
- [ ] 大文件分页预览(上一页 / 下一页)
- [ ] 文件操作(重命名 / 删除 / 新建,受 fs 权限围栏约束)

**线路 C — 生态与分发**

- [x] npm 包 `@jiyr0119/dsh-workspace-explorer`(v0.1.1 发布中)
- [x] awesome-dsh-plugin 收录(PR #1158)
- [ ] 原生 DSH 包(`@Remote` 命名空间,需上游支持)— 见 [`docs/native-package.md`](./docs/native-package.md)
- [ ] 接入 dsh-genie 固化安装(host 侧持久化)
- [ ] CI:lint + e2e + 自动发布

**线路 D — 质量与可维护性**

- [ ] 虚拟滚动(超大目录性能)
- [ ] 浅 / 深色主题回归检查
- [ ] Playwright e2e(演示页与真实插件)

## License

[MIT](./LICENSE)
