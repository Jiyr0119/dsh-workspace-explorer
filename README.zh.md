# dsh-workspace-explorer

[English](README.md) | **中文**

[![License](https://img.shields.io/github/license/Jiyr0119/dsh-workspace-explorer)](LICENSE)
[![npm](https://img.shields.io/npm/v/@jiyr0119/dsh-workspace-explorer)](https://www.npmjs.com/package/@jiyr0119/dsh-workspace-explorer)
[![npm downloads](https://img.shields.io/npm/dt/@jiyr0119/dsh-workspace-explorer)](https://www.npmjs.com/package/@jiyr0119/dsh-workspace-explorer)
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
[![Last commit](https://img.shields.io/github/last-commit/Jiyr0119/dsh-workspace-explorer)](https://github.com/Jiyr0119/dsh-workspace-explorer)

> 给 DeepSeek Harness Web UI 的工作区文件资源管理器:会话头部一个**「工作区文件」胶囊按钮**(功能名称 + 文件夹图标,与 Session log 按钮同排)打开动画弹窗,展示当前工作区目录树;点击或拖拽文件即可把文件引用发给大模型。

灵感来自 VS Code / Cursor 的项目目录树,弥补 DSH 添加工作台后没有目录视图的空白。

## 🖥 演示 Demo

![dsh-workspace-explorer 演示](demo/preview.gif)

*演示 GIF(v0.5.1):「工作区文件」胶囊入口、多选批量插入、目录拖拽 → 紧凑目录树文本、分页预览与设置页。*

<details>
<summary><b>截图</b> Screenshots</summary>

![面板](assets/screenshots/panel.png)

![目录树](assets/screenshots/tree.png)

![插入并发送](assets/screenshots/insert.png)

</details>

## 功能特性

- 📂 **动画弹窗** — 会话头部右侧(与 session log 同排)的**「工作区文件」胶囊按钮**(功能名称 + 文件夹图标,与 DSH 原生 **Session log** 下载按钮同款样式)点击后,弹出一个带淡入/缩放动画的浮动面板;弹窗位置实时测量,**位于会话头部与输入框之间**(聊天区右侧),绝不会盖住输入框
- 🗂 **顶部 Tab 栏** — 弹窗顶部点击「文件 / 设置」切换页面;设置页实时调节行为(隐藏噪声目录、显示大小、引用格式、预览行数、面板宽度),并同步进 DSH 设置 → 工作区文件
- 🗂 **懒加载展开** — 目录按需加载,自动隐藏 `node_modules` / `.git` / `dist` / `__pycache__` 等噪声目录
- 🎨 **文件类型图标** — 按扩展名着色的实心文档徽标(TS / JS / Python / JSON / Markdown / 图片 / 配置 / 脚本等),目录为琥珀色文件夹、展开态高亮
- 🖱 **点击插入** — 点击文件行,在输入框末尾追加 `[file: 相对路径]` 引用,发送后模型会用 `read` 读取真实内容
- 🖱 **拖拽插入** — 文件拖到输入框内任意位置在光标处插入(带全屏虚线提示),拖到其他位置则追加到末尾;**目录也可拖拽**,松开即插入限层数的紧凑目录树文本
- 🖱 **多选批量插入** — Shift / ⌘ 点击多选,一键批量插入(文件 → 引用,目录 → 目录树)
- 🌓 **跟随主题** — 全部使用 DSH 的 `--dsw-alias-*` 设计 token,浅色/深色自动适配;原生弹窗外观(16px 圆角、lv3 阴影)
- 🔍 **搜索过滤** — 按文件名过滤已加载目录,平铺展示结果并显示匹配数
- 👁 **分页预览** — 任意文本文件按行翻页预览(上一页 / 下一页),显示总行数与当前页;可插入引用,小文件(≤32KB)可直接插入完整内容
- 🌐 **国际化** — 通过 DSH locale 服务注册中/英词典,面板跟随 DSH 界面语言切换

## 快速开始

### 安装与使用

**方式一 · 原生安装(`dsh plugin add` / 商店)— 推荐**
一条命令装好完整插件,无需构建、无需改任何配置。npm 包同时提供原生 Host 半区(`lib/index.js`,webServer JSON 路由,含 `/dsh-we/api/config`)和浏览器 bundle(`lib/client.js` 经 `dsh.plugin.json`)。

```bash
dsh plugin --profile web add -w @jiyr0119/dsh-workspace-explorer@latest
```

(或在 DSH 市场点击安装按钮)。安装后会话头部即出现**「工作区文件」胶囊(名称 + 图标)**;必要时重启或硬刷新 Web UI。这是零配置、免构建的路径。

**方式二 · npm 源码包(手动粘贴)**
`npm install @jiyr0119/dsh-workspace-explorer` — 内含 `dynamic/host.js` / `dynamic/client.js`,按方式三粘贴即可,版本随 semver 发布。

**方式三 · 动态插件粘贴(零构建备用)**
*动态 Cordis 插件*:无需构建、无需改任何配置,适合快速尝试或没有商店的环境。

1. 在 DSH Web UI 中让 Agent 执行 `cordis_define`(或使用动态插件面板),`idPrefix` 填 `wsex`
2. 将 [`dynamic/host.js`](./dynamic/host.js) 全文粘贴到 **Host 代码**
3. 将 [`dynamic/client.js`](./dynamic/client.js) 全文粘贴到 **Client 代码**
4. `cordis_run` 激活,首次出现 Run 卡时点击授权
5. 点击会话头部**「工作区文件」胶囊**(名称 + 文件夹图标)→ 展开目录 → 点击文件,或拖进输入框,然后发送

> ℹ️ **pnpm 提示**:现代 pnpm(9/10)会拒绝在 workspace root 直接 add(`ERR_PNPM_ADDING_TO_ROOT`),故命令带 `-w`。另一种做法:在 `~/.dsh/profiles/web/.npmrc` 写入 `ignore-workspace-root-check=true`。

> ⚠️ **常见误解**:收录本身不会自动安装任何东西 —— 用户仍需点安装。方式一安装后即出现完整 UI(原生 bundle,v0.4.0+ 已验证 `dsh plugin add` 干净安装、无启动报错)。

详细步骤见 [`docs/install.md`](./docs/install.md)。

### 使用

1. 点击会话头部右上角的**「工作区文件」胶囊按钮**(功能名称 + 文件夹图标,与 Session log 按钮同排)打开弹窗
2. 展开目录浏览文件
3. 点击文件,或把它拖进聊天输入框,然后发送
4. 用弹窗顶部的「设置」Tab(或 DSH 设置 → 工作区文件)调整面板行为

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
│       └── pages.yml     # 部署 demo/ 到 GitHub Pages(手动;预览已隐藏)
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
| 弹窗 | `shell.overlay` 槽位(`useWorkspaces` / `useSessions`),位置在会话头部与输入框之间实时测量 |
| 开关按钮 | `conversation.session.header.utilities` 槽位(「工作区文件」胶囊:名称 + 图标) |
| 写入输入框 | `conversation.input.dock` → `inputActions.setDraft` |
| 拖拽插入 | HTML5 DnD;输入框内走原生光标插入,其他位置追加 |
| 主题适配 | `--dsw-alias-*` CSS 变量(浅/深色自动) |

## 版本

当前版本 **v0.5.1** — 会话头部入口升级为**「工作区文件」胶囊(功能名称 + 文件夹图标)**,与 DSH 原生 Session log 按钮同款样式;演示 GIF 已重录,展示新入口与 M1 读路径特性(多选批量插入、目录拖拽生成目录树、分页预览、设置页)。
变更记录见 [CHANGELOG.md](./CHANGELOG.md)。

## Roadmap

聚焦两条与产品真正相关的主线:**读路径**(把模型指向代码)与**写路径**(编辑文件)。其余事项全部挪到 Backlog 搁置,不再与产品功能平级。

**已完成 ✅**

- [x] v0.1 核心:右侧文件树、点击/拖拽插入引用、DSH 原生观感
- [x] 搜索过滤;内联预览(前 60 行);小文件(≤32KB)内容插入
- [x] 国际化(zh/en,跟随 DSH 界面语言)
- [x] 演示页中英切换、GitHub Pages 预览、演示 GIF、市场截图素材
- [x] npm 源码包 + `dsh.bundle` 契约 + awesome 列表([#1158](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/1158))

**主线 M1 — 读路径体验 ✅(v0.5.0)**

- [x] **多目标引用**:目录拖拽(插入限层数的紧凑目录树文本)+ 多选批量插入文件引用(Shift / Cmd)——同一能力,一个里程碑
- [x] **大文件分页全量预览**(上一页 / 下一页、懒加载),取代 60 行 / 200KB 上限,而不是一次性渲染整份内容

**主线 M2 — 写路径(单独的产品决策)**

- [ ] **面板内文件编辑**:审批门 + 原子保存 + 磁盘变更检测(提示文件已被外部修改);从这里起插件不再是只读工具,属于刻意的重新定位,需同步更新定位文案与截图

**搁置 Backlog**(出现真实需求再做)

- 跨已加载目录的内容搜索(host 侧 grep);最近文件 / 收藏夹
- 面板可拖动/可调宽并记住位置;完整键盘导航;复制路径 / 在系统文件管理器中显示
- 虚拟滚动(超大目录);浅/深色主题回归检查;Playwright e2e

**依赖上游的杂务**

- 原生 DSH 包(`@Remote` 命名空间,需上游支持)— 见 [`docs/native-package.md`](./docs/native-package.md)
- 接入 dsh-genie 固化安装;CI(lint + e2e + 自动发布)

## License

[MIT](./LICENSE)
