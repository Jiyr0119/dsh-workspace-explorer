# 原生挂载验证手册 / Native Mount Verification (v0.2.0)

目标:验证 `dsh plugin add` / market 一键安装后,**浏览器面板真实出现**。

## 前置

- 已构建:`lib/index.js`(host)+ `lib/client.js`(browser,`__ModuleLoader__` id = `@jiyr0119/dsh-workspace-explorer`)
- 打包:`npm pack` → `@jiyr0119-dsh-workspace-explorer-0.2.0.tgz`(示例已生成在 `/tmp/`)

## 步骤

```bash
# 1. 装进 web profile(pnpm 需可用)
cd ~/.dsh/profiles/web
pnpm add /tmp/jiyr0119-dsh-workspace-explorer-0.2.0.tgz

# 2. 追加插件行到组合(先备份 cordis.yml)
cp cordis.yml cordis.yml.bak
# 在 cordis.yml 末尾追加(若该文件是补丁式,改用 dsh plugin add 自动写入):
#   - id: workspace-explorer
#     name: @jiyr0119/dsh-workspace-explorer

# 3. 重启 dsh web(⚠️ 会中断当前 DSH 会话)
#    (重新执行你平时的启动命令,如 pnpm dev / dsh web)
```

> 若 `dsh plugin --profile web add` 支持本地路径,可直接:
> `dsh plugin --profile web add /tmp/jiyr0119-dsh-workspace-explorer-0.2.0.tgz`

## 验证清单

- [ ] 侧边栏底部出现 📁「文件」按钮,点击后**右侧面板出现**
- [ ] 目录树加载(list 路由)→ 展开目录 → 点击文件插入 `[file: …]` 引用
- [ ] 拖拽文件到输入框插入引用;拖拽提示正常
- [ ] 搜索过滤、👁 预览(peek 路由)、中英切换正常
- [ ] 硬刷新(Cmd/Ctrl+Shift+R)后面板仍在(client 改动无需重启 host)

## 回滚

```bash
cd ~/.dsh/profiles/web
git checkout cordis.yml        # 或 cp cordis.yml.bak cordis.yml
pnpm remove @jiyr0119/dsh-workspace-explorer
# 重启 dsh web
```

## 已知待确认点

- profile 当前无 node_modules(从未装过插件):`pnpm add` 会拉取依赖,确认 pnpm 可用
- host 半区注入 `webServer` 的准确性:若挂载报 `service "webServer" is not declared`,说明该 DSH 版本服务名不同,需按当时版本调整(见 `src/index.ts` 的 `inject`)
- `/dsh-we/api/*` 路由无信任围栏(首版从简),后续按 better-sidebar 的 trust-fence 模式补充
