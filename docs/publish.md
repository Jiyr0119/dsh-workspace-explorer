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
git add .
git commit -m "feat: ..."        # 提交变更 / commit changes
git push                          # 推送到 main / push
git tag v0.1.1                    # 每次发布打新标签 / tag a new version per release
git push origin v0.1.1
```

建议:仓库 Description 带上 `deepseek-harness`、`cordis`、`plugin` 关键词,方便检索。
Tip: put `deepseek-harness`, `cordis`, `plugin` in the repo description for discoverability.
