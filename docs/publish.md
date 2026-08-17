# 发布到 GitHub / Publishing to GitHub

项目当前为独立仓库目录,可直接发布。以下为完整流程(二选一)。

The project is a standalone repo directory, ready to publish. Full workflow below (pick one).

## 0. 发布前检查 Pre-flight

```bash
cd dsh-workspace-explorer
# 把占位信息改成你自己的 / replace placeholders:
#   package.json -> repository.url
#   LICENSE      -> copyright line
```

## 0.5 发布前必做验证(血泪教训)/ Mandatory pre-publish verification

> 2026-08 教训:0.3.0/0.3.1 两次真实安装后崩/坏 —— `cordis.patch.yml` 的 `@` 作用域包名未加引号导致 `dsh web` 启动解析补丁崩溃;`webServer.register` 传入数组导致路由全部静默失效(浏览器报 `Unexpected end of JSON input`)。**发布前必须做下面三步,缺一不可。**

```bash
# 1) 构建 / build
npm run build

# 2) 补丁解析回归:临时 profile 装一次,跑崩溃路径(组合解析)
dsh plugin --profile preflight add -w "file:$(pwd)"
dsh --profile preflight --dump-config >/dev/null && echo OK
rm -rf "$HOME/.dsh/profiles/preflight"

# 3) Host 路由功能验证:真实 webServer 服务 + 全部 /dsh-we/api/* 路由
#    (见仓库 .wecheck 系列临时脚本:list / config / peek / bad-rel 校验)

# 4) 真实挂载确认(浏览器):装进真实 web profile 并重启 dsh web
#    dsh plugin --profile web add -w @jiyr0119/dsh-workspace-explorer@latest
#    重启后侧边栏底部出现 📁 文件按钮,面板可展开目录 / 拖拽插入 / 设置生效
```

注意:现代 pnpm(9/10)在 workspace root 直接 `add` 会报 `ERR_PNPM_ADDING_TO_ROOT`,命令必须带 `-w`(或在 profile 的 `.npmrc` 写 `ignore-workspace-root-check=true`)。

## 1. 用命令行创建仓库(需要 GitHub CLI)Create the repo with the CLI (requires gh)

```bash
cd dsh-workspace-explorer
git init
git add .
git commit -m "chore: v0.1.0 release"
git branch -M main

# 创建远程仓库并推送 / create the remote repo and push
gh repo create dsh-workspace-explorer --public --source=. --remote=origin --push
# 或者私有 / or private: --private

# 打 v0.1 标签并发布 / tag and publish v0.1
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 --title "v0.1.0" --notes "首个正式版本:工作区文件资源管理器 / First release: workspace file explorer"
```

## 2. 或在网页上创建 Create the repo on the web instead

```bash
# 1. 在 github.com 新建空仓库(不要勾选 README/.gitignore)
#    Create an EMPTY repo on github.com (do NOT add README/.gitignore)
cd dsh-workspace-explorer
git init
git add .
git commit -m "chore: v0.1.0 release"
git branch -M main
git remote add origin https://github.com/<your-org>/dsh-workspace-explorer.git
git push -u origin main
git tag v0.1.0
git push origin v0.1.0
# 2. 在仓库 Releases 页手动创建 v0.1.0 发布说明 / then create the v0.1.0 release notes on the Releases page
```

## 3. 之后怎么迭代 Subsequent iterations

```bash
# 每次发布前:验证(见 §0.5)→ bump 版本 → 构建 → 发布
npm version patch -m "chore: v0.3.x"     # 或手动改 package.json / dsh.plugin.json / manifest.json
npm run build
npm publish                              # 账号开 2FA 时需输入一次性验证码(OTP)
git add .
git commit -m "feat: ..."        # 提交变更 / commit changes
git push                          # 推送到 main / push
git tag v0.1.1                    # 每次发布打新标签 / tag a new version per release
git push origin v0.1.1
```

建议:仓库 Description 带上 `deepseek-harness`、`cordis`、`plugin` 关键词,方便检索。
Tip: put `deepseek-harness`, `cordis`, `plugin` in the repo description for discoverability.

## 4. gh CLI 一条龙(已授权)/ One-shot with gh (authenticated)

```bash
# 设置描述 / 主页 / topics / set description, homepage, topics
gh repo edit Jiyr0119/dsh-workspace-explorer \
  --description "DeepSeek Harness 工作区文件资源管理器..." \
  --homepage "https://jiyr0119.github.io/dsh-workspace-explorer/" \
  --add-topic deepseek-harness --add-topic cordis --add-topic dsh-plugin

# 发布 Release / create a release (需要先打 tag / tag first)
git tag v0.1.0 && git push origin v0.1.0
gh release create v0.1.0 --title "v0.1.0" --notes "..."

# 查看 Pages 状态 / inspect Pages
gh api repos/Jiyr0119/dsh-workspace-explorer/pages --jq .html_url
```
