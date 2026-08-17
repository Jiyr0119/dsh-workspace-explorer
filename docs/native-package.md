# 原生 DSH 包方案 / Native DSH Package Roadmap

> 当前插件是**动态 Cordis 插件**(粘贴 `dynamic/host.js` + `dynamic/client.js` 安装,依赖动态运行器的 `harness.handle` / `host.call`)。要让 `dsh plugin add` / dsh-market 一键安装后**浏览器面板真正出现**,正解是把插件转成**原生双包**:Host Remote 服务 + Client 浏览器包。**好消息:这条路径不依赖上游核心改造**(见下)。

## 关键发现(2026-08):第三方包可以自建 Remote

之前误以为必须改核心 `HostApi`。实际查证:

- DSH 的 Typert 网关(`@deepseek-ai/dsh-api-gateway` 的 `typertGateway`)会为**任何注册进 `ctx.typert.local` 的 Remote 方法**生成活的 `/api/<namespace>/<method>` 端点,并支持"严格生成定义或保守 SRC 标记(运行时反射)"两种解析。
- 官方范例:`packages/host/plugin-inventory` —— 一个独立 Host 包,`class PluginInventoryGateway extends TypertRemoteService` + `@Remote('list')`,零核心改动即暴露浏览器可调的 `pluginInventory.list`。
- 浏览器端:命名空间来自 host 包的**生成产物**(`import pluginInventoryRemote from '@deepseek-ai/dsh-host-plugin-inventory/remote'`),聚合在 `packages/api/remotes` —— 第三方 client 包同样可以直接 import 自己 host 包生成的 `./remote` 绑定,不必进核心聚合。

**结论:第三方"host Remote 服务 + client 浏览器包"双包组合可以做到 `dsh plugin add` 即装即用,不需要上游 PR / fork。**

## 原生双包改造计划(推荐)

### Phase 1 — Host 包 `@jiyr0119/dsh-host-workspace-explorer`

仿照 `packages/host/plugin-inventory/src/index.ts`:

```ts
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'

export class WorkspaceExplorerGateway extends TypertRemoteService {
  static inject = ['fs']
  constructor(ctx: Context) { super(ctx, 'workspaceExplorer') }

  @Remote('listTree')
  listTree(request: { path: string; rel: string }): Promise<{ entries: WsEntry[]; truncated: boolean }> {
    // 移植 dynamic/host.js 的列目录逻辑(ctx.fs.resolve/listDir/processPath)
  }

  @Remote('peek')
  peek(request: { path: string }): Promise<PeekResult> {
    // 移植 ws-tree.peek(stat + readBytes + 前 60 行)
  }
}
export default WorkspaceExplorerGateway
```

- 用 typert 生成 `./typert` + `./remote` 产物(生成器在 DSH 仓 `packages/typert/generator`;若第三方不可用,网关的 **SRC 标记运行时反射**也能解析,代码可照常发布)
- cordis 行:`- id: host-workspace-explorer, name: @jiyr0119/dsh-host-workspace-explorer`

### Phase 2 — Client 包 `@jiyr0119/dsh-client-ui-workspace-explorer`

- 把 `dynamic/client.js` 的组件移植为 **TSX**(`ExplorerPanel.tsx` + `ExplorerPanel.module.css` + `icons.tsx`),参考 `ui-directory-picker-browse` 的包结构(package.json 带 `dsh.client.platform: web`、tsdown 构建出 `lib/`)
- 用生成绑定调用 Host(替换 `host.call`):`import { workspaceExplorerRemote } from '@jiyr0119/dsh-host-workspace-explorer/remote'` → `ctx.remote.workspaceExplorer.listTree({path, rel})`
- 槽位注册不变(`shell.overlay` / `sidebar.footer.action` / `conversation.input.dock`),i18n 用 `ctx.locale`(已实现,直接移植)

### Phase 3 — 组合接线与发布

- `cordis.patch.yml` 改为插入两行(host + client)
- 两个包发 npm;用户 `dsh plugin --profile web add @jiyr0119/dsh-host-workspace-explorer @jiyr0119/dsh-client-ui-workspace-explorer`(market 一键安装走同一机制)
- 结果:`dsh plugin add` 后**浏览器面板完整出现**,和动态粘贴版功能一致

## 三条路线对比

| 路线 | 安装方式 | 浏览器 UI | 工作量 |
|---|---|---|---|
| 动态插件(现状) | 粘贴 host.js+client.js | ✅ | 0 |
| **原生双包(推荐)** | `dsh plugin add` / market 一键 | ✅ | 中:TSX 移植 + typert 接线 + 双包发布 |
| 上游 Remote PR | 同上 | ✅ | 大:核心仓改动 + 合入上游 |

## 中间路线:dsh-genie 固化(2026-08)

[`swaylq/dsh-genie`](https://github.com/swaylq/dsh-genie) 提供 `genie_keep` 把动态插件固化到 `$DSH_HOME/genie/`(package.json + cordis.patch.yml + index.js),重启后 **Host 半区存活**,免 pnpm/免构建授权。**边界(来自 genie 源码)**:client 半区只存档不挂载 —— 面板不会自动出现,是 host 侧固化的便利路线,不是 UI 可安装的最终解。

## 当前状态(2026-08)

- ✅ `dsh.bundle` + `cordis.patch.yml` + `index.js` 已声明:满足 awesome 列表门槛;`dsh plugin add` 会让 host 入口干净挂载但**无 UI**
- ✅ npm 源码包 `@jiyr0119/dsh-workspace-explorer`(0.1.1)
- ⏳ 原生双包改造(Phase 1-3)是让市场一键安装出 UI 的下一步
