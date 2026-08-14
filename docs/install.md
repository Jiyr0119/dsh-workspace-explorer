# 安装与进阶

## 方式一:动态插件(当前形态,零构建)

动态 Cordis 插件在 DSH 进程内定义并运行,不落盘到任何配置文件,进程重启后失效。

### 手动粘贴

1. 在 DSH Web UI 中,让 Agent 执行 `cordis_define`(或使用动态插件面板的「新建插件」入口),`idPrefix` 建议填 `wsex`。
2. 将 [`../src/host.js`](../src/host.js) 全文粘贴到 **Host 代码**。
3. 将 [`../src/client.js`](../src/client.js) 全文粘贴到 **Client 代码**。
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
