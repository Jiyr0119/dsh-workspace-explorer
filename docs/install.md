# 安装与进阶

## 三种使用方式速览 / Three ways to use

| 方式 | 操作 | 浏览器面板 |
|---|---|---|
| **一、动态粘贴(推荐)** | `cordis_define` 粘贴 `dynamic/host.js` + `dynamic/client.js` | ✅ 完整 UI |
| **二、npm 源码包** | `npm i @jiyr0119/dsh-workspace-explorer`,再按方式一粘贴 | ✅ 完整 UI |
| **三、商店一键安装** | 列表/market 收录后 `dsh plugin add -w` 或市场按钮 | ✅ 原生 bundle 含完整 UI(顶部 Tab + 设置页,v0.3.0+) |

> ⚠️ **常见误解**:插件市场收录 ≠ 插件自动出现在用户浏览器。收录 = 用户能浏览条目 + 执行安装命令。**v0.3.0 起方式三即装即用**(原生 bundle 含完整 UI);注意现代 pnpm 需在命令加 `-w`(或在 profile 的 `.npmrc` 写 `ignore-workspace-root-check=true`)。

## 方式一:动态插件(当前形态,零构建)

动态 Cordis 插件在 DSH 进程内定义并运行,不落盘到任何配置文件,进程重启后失效。

### 手动粘贴

1. 在 DSH Web UI 中,让 Agent 执行 `cordis_define`(或使用动态插件面板的「新建插件」入口),`idPrefix` 建议填 `wsex`。
2. 将 [`../dynamic/host.js`](../dynamic/host.js) 全文粘贴到 **Host 代码**。
3. 将 [`../dynamic/client.js`](../dynamic/client.js) 全文粘贴到 **Client 代码**。
4. `cordis_run` 激活;首次出现 Run 卡时点「允许」(单勾仅本次,双勾授权后续版本)。

### 注意事项

- 动态插件代码必须是**纯 JavaScript**,禁止 `import` / `require` / TypeScript / JSX;Client 侧用 `React.createElement`,禁用 JSX。
- `host.call` / `harness.handle` 是动态插件专属的私有 RPC 桥,只允许 JSON 双向传递 —— 参数里不能出现 `undefined` / 函数 / 类实例。

## 方式二:转成原生 DSH 包(发布为正式插件)

若想作为正式包被 `cordis.yml` 一行引用、随部署常驻,需要把动态桥换成正式 Remote 命名空间:

| 动态插件 | 原生 DSH 包 |
|---|---|
| `harness.handle('ws-tree.list')` | Host 服务上用 `@Remote('listWorkspaceTree')` 暴露方法(走 API proxy) |
| `host.call('ws-tree.list', …)` | Client 通过 `ctx.api` / 一个薄客户端服务调用该 Remote 方法 |
| `ctx.get('fs')` | Host 包 `inject: ['fs']` 或 `ctx.get('fs')` |
| `slots.inject` / `useWorkspaces` / `useInput` / `inputActions` | 直接沿用(它们本就是官方客户端服务/槽位) |

参考现成的同类包:`packages/client/ui-directory-picker-browse`(目录浏览器)与 `packages/host/directory-picker-browse`。原生包目录结构大致为:

```
packages/client/ui-workspace-explorer/
├── package.json            # name + dsh.client.inject/platform + peerDeps
├── src/client/index.ts     # apply():slots.inject + locale 注册
├── src/client/ExplorerPanel.tsx
└── src/client/icons.tsx
```

然后在 `cordis.yml`(web 组合)加一行:

```yaml
- id: ui-workspace-explorer
  name: '@your-org/dsh-client-ui-workspace-explorer'
```

## 发布到 GitHub

```bash
cd dsh-workspace-explorer
git init
git add .
git commit -m "init: dsh-workspace-explorer"
git remote add origin https://github.com/<your-org>/dsh-workspace-explorer.git
git push -u origin main
```

建议在仓库描述里带上 `deepseek-harness`、`cordis`、`plugin` 等关键词,方便检索。
