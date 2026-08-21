# DSH 插件本地调试指南

## 启动本地 DSH 开发环境（端口 3090）

```bash
# 方式一：使用 dsh web dev（推荐，已配置 alias）
dsh web dev

# 方式二：直接指定 profile 和端口
dsh --profile dev --port 3090
```

启动后访问 http://127.0.0.1:3090

> **注意：** 3080 是正式版（npm 安装的插件），3090 是开发版（本地链接的插件），两者完全隔离，互不影响。

---

## 将本地插件链接到 3090 环境

### 1. 编辑 dev profile 的 package.json

```bash
vim ~/.dsh/profiles/dev/package.json
```

添加插件依赖和 bundles 配置：

```json
{
  "name": "dsh-profile-dev",
  "private": true,
  "dependencies": {
    "@jiyr0119/dsh-workspace-explorer": "file:/Users/jonathan/workspaceforme/dsh-workspace-explorer",
    "dshmarket": "^1.15.0"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dshmarket",
        "@jiyr0119/dsh-workspace-explorer"
      ]
    }
  }
}
```

### 2. 安装依赖

```bash
cd ~/.dsh/profiles/dev
pnpm install
```

### 3. 用 symlink 替换 npm 版本（关键步骤）

```bash
# 删除 pnpm 安装的版本
rm -rf ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-workspace-explorer

# 创建 symlink 指向本地项目
ln -s /Users/jonathan/workspaceforme/dsh-workspace-explorer ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-workspace-explorer
```

### 4. 验证链接

```bash
ls -la ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-workspace-explorer
# 应该显示 → /Users/jonathan/workspaceforme/dsh-workspace-explorer
```

---

## 开发工作流

```
修改代码 → npm run build → 刷新浏览器（不需要重启 DSH）
```

1. 在本地项目目录修改代码
2. 执行 `npm run build` 构建
3. 刷新 http://127.0.0.1:3090 即可看到变化

**注意：** symlink 方式下，DSH 直接读取 `lib/` 目录的构建产物，所以只需要 build，不需要重启服务。

---

## 快捷脚本

### 添加新插件

```bash
~/.dsh/profiles/dev/add-plugin.sh @jiyr0119/my-plugin ~/workspaceforme/my-plugin
```

### 移除插件

```bash
~/.dsh/profiles/dev/rm-plugin.sh @jiyr0119/my-plugin
```

---

## 发布新版本

```bash
# 1. 升级版本号
# package.json 和 dsh.plugin.json 中的 version 同步修改

# 2. 运行测试
npm test

# 3. 登录 npm（如果未登录）
npm login

# 4. 发布
npm publish
```

---

## 常见问题

### Q: 刷新后插件没有加载？

检查 symlink 是否存在：
```bash
ls -la ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-workspace-explorer
```

如果不存在，重新执行步骤 3 创建 symlink。

### Q: 修改代码后刷新没有变化？

确保已执行 `npm run build`。symlink 只是链接目录，不会自动构建。

### Q: 3090 端口被占用？

```bash
# 查找占用端口的进程
lsof -nP -iTCP:3090 -sTCP:LISTEN

# 终止进程
kill <PID>
```

### Q: 想用 npm 注册的正式版本测试？

```bash
# 删除 symlink，重新安装 npm 版本
rm ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-workspace-explorer
cd ~/.dsh/profiles/dev
pnpm install
```

---

## 目录结构

```
~/.dsh/profiles/
├── web/                          # 正式版（3080）
│   ├── package.json              # npm 安装的插件
│   ├── node_modules/
│   └── cordis.patch.yml
│
└── dev/                          # 开发版（3090）
    ├── package.json              # file: 依赖
    ├── node_modules/
    │   └── @jiyr0119/
    │       └── dsh-workspace-explorer → /path/to/local/project  (symlink)
    ├── add-plugin.sh             # 添加插件脚本
    ├── rm-plugin.sh              # 移除插件脚本
    └── cordis.patch.yml

/path/to/local/project/
├── src/                          # 源码
├── lib/                          # 构建产物（DSH 实际加载的）
├── dsh.plugin.json               # 插件配置
└── package.json
```

---

## ⚠️ 重要提醒

**不要用 `file:` 依赖 + `pnpm install` 的方式！**

pnpm 的 `file:` 依赖会在 store 里创建副本，rebuild 后不会自动更新。必须：

1. `pnpm install` 安装依赖
2. **删除** pnpm 安装的版本
3. **手动创建** 直接指向本地目录的 symlink

这样 rebuild 后只需要刷新浏览器，不需要重启服务。
