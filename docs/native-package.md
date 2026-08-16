# 原生 DSH 包方案 / Native DSH Package Roadmap

> 说明(诚实版):当前插件是**动态 Cordis 插件**,通过 DSH 动态插件机制(`harness.handle` / `host.call`)实现 Host↔Client 私有 RPC。npm 包发布的是这份动态插件**源码**,用户按"粘贴安装"方式使用。若要做成"cordis.yml 一行挂载"的**原生 DSH 包**,需要改动 DSH 核心仓库 —— 见下文。

## 为什么独立包无法自建 Remote

- DSH 的浏览器↔Host RPC 契约(`HostApi`)定义在核心仓:`packages/host/apiproxy/src/api/host.ts`
- Remote 命名空间统一声明在 `packages/api/remotes`(如 `ctx.remote.dynamicCordisRunner`),由核心 Host 包实现,经 `/api` 网关暴露
- 第三方包**不能**往这份核心契约里加方法;`harness.handle`/`host.call` 桥只由动态插件运行器提供,挂载式原生包拿不到

因此"原生包"= 对 `deepseek-ai/deepseek-harness` 的一次**上游贡献(PR)**或 fork 改造,而不是独立仓库能独立完成的事。

## 原生方案 PR 需要动的东西(供贡献/fork 参考)

```
packages/api/remotes/src/           # 新增命名空间声明(typert/schemastery schema)
  workspace-explorer.ts             #   listTree(request: {path, rel}) → {entries, truncated}
packages/host/workspace-explorer/   # 新增 Host 包(参考 packages/host/directory-picker-browse)
  src/index.ts                      #   ctx.get('fs') 列目录,能力对象注入
  package.json                      #   name: @deepseek-ai/dsh-host-workspace-explorer
packages/client/ui-workspace-explorer/  # 新增 Client 包(参考 ui-directory-picker-browse)
  src/client/ExplorerPanel.tsx      #   面板(本项目 src/client.js 的 TSX 移植)
  src/client/ExplorerPanel.module.css #   样式(本项目 CSS 的 module 化)
  package.json                      #   name: @deepseek-ai/dsh-client-ui-workspace-explorer
cordis.yml                          # 加两行挂载(host 组合 + web 组合)
```

配套改造点:Host `fs` 服务对浏览器暴露的权限围栏(browse capability)、`RpcRequest/RpcResponse` 包裹、`@Remote` 方法的 signal 透传、`DirectoryListing` 类似的结构化返回。

## 在贡献之前,可以先用 npm 源码包

当前 `@jiyr0119/dsh-workspace-explorer` npm 包 = 动态插件源码,提供:

- **npm 存在感 + semver 版本化**:`npm view`、`npm i @jiyr0119/dsh-workspace-explorer` 可见

## 当前状态(2026-08)/ Current status

- ✅ `dsh.bundle`(`cordis.patch.yml`)+ `dsh.client.platform: web` + Host 挂载入口 `index.js` 已声明 —— 满足 awesome-dsh-plugin 列表的**清单门槛**(只查 `dsh.bundle` 是否存在)。
- ⚠️ **完整可交互安装**(`dsh plugin add` 后 UI 在浏览器生效)仍未达成:静态挂载包拿不到 `harness` 桥(`node:vm` 沙箱只为动态包注入),浏览器 UI 需要原生 Remote(上游 PR)。当前可用形态仍是动态插件:粘贴 `src/host.js` + `src/client.js`。
- **版本可追溯**:每次发版 = `npm version` + `npm publish`,与 GitHub tag 对应
- **安装体验**:用户在 DSH 里按 README 把 `src/host.js` / `src/client.js` 粘贴到动态插件面板;代码随版本更新

当 DSH 官方插件生态(或你的 fork)支持自定义 Remote 后,再按上文 PR 清单升级为原生包。
