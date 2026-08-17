# DSH 插件开发经验与 awesome-dsh-plugin 提交流程 / Dev Experience & awesome Submission

> 本文档沉淀本仓库开发过程中验证过的经验(截至 v0.4.0),供后续迭代、新插件开发、提交 awesome 时直接复用。
> This doc captures validated experience up to v0.4.0 for future iterations, new DSH plugins, and awesome-dsh-plugin submission.

---

## 一、DSH 插件的两种形态 / Two plugin shapes

| 形态 | 安装方式 | 生命周期 | 适用场景 |
|---|---|---|---|
| **动态 Cordis 插件** | 粘贴 `dynamic/host.js` + `dynamic/client.js` 到会话 | 进程级,DSH 重启即丢失 | 快速原型、临时工具 |
| **原生 npm 包** | `dsh plugin --profile web add @jiyr0119/dsh-workspace-explorer@latest` | 持久,重启保留 | 正式发布、dsh-market 一键安装 |

动态插件桥:`harness.handle(name, fn)`(host 端注册)+ `host.call(name, args)`(client 端调用)。
注意 `harness` 是 `node:vm` 沙箱全局,**仅动态包可用**,原生包没有它。

## 二、原生包架构(三件套)/ Native package architecture

```
src/index.ts           → lib/index.js   (Host: webServer 路由)
src/client/index.tsx   → lib/client.js  (浏览器:__ModuleLoader__ bundle)
dsh.plugin.json        (id / main / client.main)
cordis.patch.yml       (composition 行)
```

### 1. Host 半 — webServer 路由(不需要上游 PR)

```ts
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'

export function apply(ctx: { webServer: WebServer }) {
  ctx.webServer.register({
    kind: 'exact' as const,          // 'exact' | 'prefix'
    path: '/dsh-we/api/list',
    handler: async (req, res) => {
      // req: { url?, method?, headers, [Symbol.asyncIterator]() }
      // res: { statusCode, writeHead(status, headers?), end(body?) }
      res.statusCode = 200
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(payload))
    },
  })
}
```

要点:
- 第三方包可直接 `ctx.webServer.register` 注册 HTTP 路由,不需要改 DSH 核心(已由 `omdsh-dev/DSH-better-sidebar` 与本项目验证)。
- `@deepseek-ai/cordis`(npm 版)缺少 `webServer` 成员声明,需要自己在源码里 `declare module 'cordis'` 增强。
- Host 不要碰浏览器 API;文件系统用 `node:fs/promises`。

### 2. 浏览器半 — tsdown 打包成模块加载器闭包

- 产物必须形如:

```js
window.__ModuleLoader__.load({ id: '@jiyr0119/dsh-workspace-explorer', factory: (require) => {
  var module = { exports: {} }; var exports = module.exports;
  // ...bundle...
  return module.exports;
}})
```

- **client bundle 的 `id` 必须等于 npm 包名(含 scope)** —— client-modules 按包名键控,不一致会导致面板不挂载。tsdown.config.ts 里写死 `ID = '@jiyr0119/dsh-workspace-explorer'`(不要用 `pkg.name` 动态拼)。
- 打包工具链:**tsdown `^0.22` + lightningcss `^1.32`**。tsdown 0.6.x 与 rolldown 不兼容(FATAL `transformPlugin`),务必用新版本。
- externals:`react` / `react-dom` / `@deepseek-ai/cordis` / `dsh-client-*` 等平台模块全部外置,不打进 bundle。
- CSS Modules 用 lightningcss 内联(哈希类名 + `<style data-plugin>` 注入),样式零额外请求。
- 动态插件迁移到原生时,面板 JSX 基本可整份移植,只改 i18n / slots 的取用方式。

### 3. 装配文件

- `dsh.plugin.json`:

```json
{
  "id": "dsh-workspace-explorer",
  "version": "0.4.0",
  "main": "./lib/index.js",
  "client": { "main": "./lib/client.js" }
}
```

- `cordis.patch.yml`:往 composition 插入一行。**作用域包名必须加引号**,否则 `dsh web` 启动解析补丁崩溃:

```yaml
- insert:
    - id: workspace-explorer
      name: '@jiyr0119/dsh-workspace-explorer'
```

- package.json 里 `dsh.bundle.patch` 指向 `./cordis.patch.yml`,`dsh.plugin` 填插件元数据。

### 4. 依赖版本(血泪教训)

- 用 **rc.6 家族**:`@deepseek-ai/dsh-client-*` / `dsh-host-webserver` / `dsh-invariants` 均为 `^0.1.0-rc.6`;`@deepseek-ai/cordis ^4.0.1`;`cordis ^4.0.0-rc.7`。
- **rc.1 家族在 npm 上装不上**(缺 `@deepseek-ai/dsh-paths`,eresolve E404)——不要用。

## 三、发布前必做验证(缺一不可)/ Mandatory pre-publish checks

> 真实安装踩过的坑(0.3.0–0.4.0 三轮):
> ① `cordis.patch.yml` 作用域包名未加引号 → `dsh web` 启动崩溃(`bad indentation of a mapping entry`;`@` 不能作 YAML 裸标量起始);
> ② `webServer.register` 传入**数组** → 路由全部静默失效(数组被塞进前缀表 key=undefined,`/dsh-we/api/*` 全未注册,浏览器 `fetch().json()` 报 `Unexpected end of JSON input`);
> ③ 侧边栏旧入口按钮残留:新版本改用会话头部图标后,旧 `sidebar.footer.action` 按钮仍显示——用**空占位注册**(注册一个空组件)顶掉旧按钮,保证唯一入口。
> **register 一次只能注册一个路由,必须逐个调用,不能传数组。**

```bash
# 1) 构建
npm run build

# 2) 补丁解析回归:临时 profile 装一次,跑组合解析
dsh plugin --profile preflight add -w "file:$(pwd)"
dsh --profile preflight --dump-config >/dev/null && echo OK
rm -rf "$HOME/.dsh/profiles/preflight"

# 3) Host 路由功能验证:真实 webServer 服务 + 全部 /dsh-we/api/* 路由
#    (仓库 .wecheck 系列临时脚本:list / config / peek / bad-rel 校验)

# 4) 真实挂载确认(浏览器):装进真实 web profile 并重启 dsh web
#    dsh plugin --profile web add -w @jiyr0119/dsh-workspace-explorer@latest
#    重启后会话头部出现 📁 文件按钮,面板可展开目录 / 拖拽插入 / 设置生效
```

注意:现代 pnpm(9/10)在 workspace root 直接 `add` 会报 `ERR_PNPM_ADDING_TO_ROOT`,命令必须带 `-w`。

### UI 定位经验(v0.4.0 弹窗化)

- 面板不占用壳的 details 列:不要调 `layout.openDetails/closeDetails` 抢占壳的「工具调用详情」;自己用 `shell.overlay` + 绝对定位浮层。
- 弹窗位置**实时测量**:锚在会话头部底部与 composer 顶部之间,窗口缩放/布局变化时跟随,绝不遮挡输入框。
- 动画尊重 `prefers-reduced-motion`(用户关动画时不要强制播放)。
- `DockBridge` 等输入桥要对 `useInput` 等外部 prop 做空值守卫,避免壳未注入时崩溃。

## 四、npm 发布 / npm publish

```bash
npm run build
npm publish            # 账号开 2FA 时,需输入一次性验证码(OTP)
```

- `prepublishOnly: npm run build` 会自动重新构建,无需手动先跑。
- 账号开启 2FA 后 `npm publish` 会要求 OTP(30 秒过期,不适合转交别人代跑)。
- 版本号保持三处同步:`package.json` / `dsh.plugin.json` / `manifest.json`(CHANGELOG 同步记)。

## 五、GitHub 提交身份 / Commit identity

- GitHub 仓库:作者名 `Jiyr0119`,邮箱 `jiyr0119@gmail.com`(仓库级 `git config` 强制;公司环境用 `~/.gitconfig` 的 `includeIf "gitdir:~/workspaceforme/"` 自动切换)。
- 不要用公司邮箱/真名提交 GitHub 公开仓库。
- 若历史里混入错误身份,可用 `git filter-branch --env-filter` 重写 + `--tag-name-filter cat` + force push(注意 SHAs 全变,协作者需 reset)。

## 六、awesome-dsh-plugin 提交流程 / Submission workflow

> ⚠️ **仓库关系(重要,别再搞错)**:真正的上游是 **`awesome-dsh-plugin/awesome-dsh-plugin`**(官方组织,源仓库)。`omdsh-dev/awesome-dsh-plugin` **本身也是一个 fork**(parent 指向官方仓库),不是上游!提交 PR 一律走官方仓库;本地 clone 只认官方 upstream + 自己的 fork `Jiyr0119/awesome-dsh-plugin`。**判断"上游是什么"要用 `gh api repos/<repo> --jq .parent` 核实,别凭 README 或直觉。**
> ⚠️ **流程(2026-08-17 核实,别再被带偏)**:canonical 上游**没有重构**——README 仍由 **`data/plugins/*.yml` + `node scripts/generate-readme.mjs` 生成**,**禁止手改 README**。PR check 的 CI 步骤 `READMEs match data/plugins` 会校验一致性,手改 README 直接 CI 失败(`generate-readme.mjs --check` 不通过)。
> ⚠️ **"直接改 README"的教训**:曾把 omdsh-dev fork 的某次重构状态误当成 canonical 现状,按"直接改 README"提了 PR #1359 → CI 失败被关闭。**任何"上游重构"的说法都要在 canonical 仓库上亲自验证**(`git ls-tree upstream/main scripts/` 看有没有 generate-readme.mjs)。
> ✅ **已收录**:PR **#1158**(2026-08-16,双语)已合并,条目 + 3 张截图在官方仓库。v0.4.0 描述更新走 **PR #1362**(2026-08-17,双语,CI 全绿 CLEAN)。

### 1. 门槛要求(贡献指南)

- 仓库的 `package.json` 声明 **`dsh.bundle`**(`dsh.bundle.patch` → `cordis.patch.yml`),只声明 `dsh.client` 会被拒。
- 仓库有真实可用的代码、活跃维护;添加 `dsh-plugin` topic;repo 年龄 ≥ 1 天、commits ≥ 10。
- 描述只说功能,不带营销词(superlatives)。

### 2. 正确流程(先 issue,后 PR)/ The right workflow

**canonical 维护者习惯:先提一个双语 issue 讨论(如 #1142 / #1361),按维护者建议再提双语 PR(#1158 / #1362)。不要跳过 issue 直接提 PR。**

```bash
# 0) 准备:clone 自己的 fork,加官方 upstream(别加 omdsh-dev!)
gh repo clone Jiyr0119/awesome-dsh-plugin && cd awesome-dsh-plugin
git remote add upstream https://github.com/awesome-dsh-plugin/awesome-dsh-plugin.git

# 1) 双语 issue(中英对照,描述改动意图 + 拟更新文案)
gh issue create --repo awesome-dsh-plugin/awesome-dsh-plugin --title "..." --body-file issue.md

# 2) 从 canonical 最新 tip 建分支(fork 的 main 可能因 shallow clone 历史不相关)
git fetch upstream main
git checkout -b feat/xxx upstream/main

# 3) 改 YAML 数据源(README 勿手改!)
#    data/plugins/Jiyr0119__dsh-workspace-explorer.yml  → description.en / description.zh

# 4) 重新生成 README + 本地跑全部 PR check 步骤
npm ci
node scripts/generate-readme.mjs          # 重新生成两个 README
node scripts/generate-readme.mjs --check  # 校验通过
npx awesome-lint                          # 应 exit 0(存量 warning 可忽略)
node scripts/build-site.mjs               # 应 exit 0

# 5) 提交(README.md + README.zh.md + YAML 一起)→ push → 双语 PR
git add README.md README.zh.md data/plugins/Jiyr0119__dsh-workspace-explorer.yml
git commit -m "Update ... description to v0.4.0"
git push origin feat/xxx
gh pr create --repo awesome-dsh-plugin/awesome-dsh-plugin --base main --head Jiyr0119:feat/xxx \
  --title "更新 ... 描述至 v0.4.0 / Update ... description to v0.4.0" --body-file pr.md

# 6) 等 CI(~1 分钟内),确认 check SUCCESS + mergeState CLEAN
gh pr view <num> --repo awesome-dsh-plugin/awesome-dsh-plugin --json statusCheckRollup,mergeStateStatus
```

### 3. YAML 条目格式

```yaml
url: https://github.com/Jiyr0119/dsh-workspace-explorer
name: Jiyr0119/dsh-workspace-explorer
category: ui
description:
  en: 'Standalone workspace file-tree panel for the DSH web UI: ...; single-purpose, zero-config, one-command install.'
  zh: '独立单功能的工作区文件树面板：...；零配置，一条命令即装即用。'
```

- 描述以句号结尾;含 `: `(英文冒号+空格)必须加引号;避免裸 `[file: ...]`(awesome-lint no-undefined-references,需转义 `\[file: ...\]`)。
- 截图在 `data/screenshots.json`(key = 仓库 URL,值 = raw.githubusercontent 图片数组,已收录 3 张)。

### 4. 差异化定位(单插件 vs 全家桶)/ Product positioning

awesome 里大量 UI 插件是**一整套工作台**(如 `omdsh-dev/DSH-better-sidebar`:文件编辑 + 终端 + Git + 子代理全家桶,还有配套的 workspace-search / media-preview 等子插件)。本插件定位要突出**单插件、即插即用**:

- **独立单插件**:只做「工作区文件树 + 引用插入」一件事,不捆绑终端/Git/子代理等,不抢占壳的 details 列与工具详情。
- **即插即用**:`dsh plugin add` 一条命令装完即用,零配置、无构建、不依赖其他插件;原生包自带 host 路由 + 浏览器 bundle。
- 描述用「standalone / single-purpose / zero-config / one-command」这类事实词,和 better-sidebar 的「full sidebar workbench」形成对比。

### 5. 合并冲突与查重

- 合并冲突时:README 是生成的,冲突通常出现在 YAML 或 README 的相邻条目行——取 theirs(其他条目优先),把自己的行补回去,重新 `generate-readme.mjs`。
- 提交前用 `gh search prs --repo awesome-dsh-plugin/awesome-dsh-plugin "owner名"` 查是否已有条目/PR,别重复新增(已有条目应走**更新描述**而非新增一行)。

### 6. 收录 ≠ 浏览器自动生效

- dsh-market(DSH 内商店)自动同步 awesome 列表;但**商店收录不代表插件装完就有 UI** —— 0.2.0 原生化之前,商店安装只有 host 端、没有浏览器面板。README 要诚实写明当前安装方式的效果。

---

## 七、i18n(原生包)/ Localization

```ts
import { useLocale } from '@deepseek-ai/dsh-client-locale'
const { t } = useLocale('dsh-workspace-explorer')   // 命名空间唯一,避免与官方冲突
```

- DSH 只支持 zh / en 两个 locale;词典用 `locale.register(ns, locale, dict)` 注册、`locale.bind(ns)` 取稳定 `t()`。
- 插件 UI 文本全部走 t(),不允许硬编码中文/英文。

## 八、动态插件版本的经验(迁移前形态)/ Dynamic plugin lessons

- TDZ:`addWorkspace` 等函数声明必须放在引用它的代码**之前**,否则 `Cannot access before initialization`(浏览器直接挂)。
- 预览图标 click 与拖拽冲突(行可拖拽会吞 click):改用 `onMouseDown` + `preventDefault` + `stopPropagation` 打开预览,键盘 `P` 也能开。
- 面板过高挡住输入框:`height: min(640px, calc(100dvh - 110px))`,并设最小高度。
- `slots.inject` 类型:组件类型收不严时,把 inject 函数签名放宽为返回 `unknown`。

## 九、版本演进时间线(v0.2.0 → v0.4.0)/ Release timeline

- **v0.2.0** — 原生单包重构:Host `src/index.ts`(webServer `/dsh-we/api/list` + `/peek`)+ 浏览器 `src/client/index.tsx`(dsh.plugin.json client.main + `__ModuleLoader__`);动态版保留 `dynamic/`。
- **v0.3.0** — 顶部 Tab(文件/设置)+ 设置页(隐藏噪声目录/显示大小/引用格式/预览行数/面板宽度),设置镜像进 DSH 设置壳;Host 加 `/dsh-we/api/config`。
- **v0.3.1** — 修复 `cordis.patch.yml` 作用域包名未加引号导致的 `dsh web` 启动崩溃。
- **v0.3.2** — 修复 `webServer.register` 传数组导致路由静默失效;面板改为右上角 dock 式(可拖宽 280–640px)。
- **v0.4.0** — 面板从 details 列抽屉改为**浮动弹窗**,入口移到会话头部文件树图标;位置实时测量在 header 与 composer 之间;空占位顶掉旧侧边栏按钮;不占用壳的 details 列。
- **npm 版本同步**:每版同步更新 `package.json` / `dsh.plugin.json` / `manifest.json` / `CHANGELOG.md` 四处。
