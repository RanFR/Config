---
name: pr-creator
description: 创建 Git Pull Request 的专业技能。自动化 PR 创建流程，包括分支管理、更改分析和 PR 描述生成。
---

# PR 创建者

## 说明

此技能帮助您创建完整的 Git Pull Request，从分支管理到 PR 描述生成。

## 功能

1. **分支检查**: 确保当前分支适合创建 PR
2. **更改分析**: 分析即将提交的更改
3. **PR 创建**: 使用 gh CLI 创建 Pull Request
4. **描述生成**: 自动生成结构化的 PR 描述

## 使用步骤

### 1. 准备工作
```bash
# 确保已登录 GitHub CLI
gh auth status

# 检查当前分支状态
git status
```

### 2. 分析更改
```bash
# 查看所有更改
git diff

# 查看暂存的更改
git diff --staged

# 查看提交历史
git log --oneline -5
```

### 3. 创建 PR
```bash
# 推送当前分支到远程
git push -u origin HEAD

# 创建 Pull Request
gh pr create --title "PR 标题" --body "PR 描述"
```

### 4. PR 模板

使用以下模板创建结构化的 PR 描述：

```markdown
## 概述
简要描述此 PR 的目的和主要更改。

## 更改类型
- [ ] 新功能
- [ ] 错误修复
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他

## 测试
- [ ] 已添加新测试
- [ ] 现有测试通过
- [ ] 手动测试完成

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已进行自我代码审查
- [ ] 已更新相关文档
- [ ] 无合并冲突

## 相关 Issue
关联的 Issue 编号（如有）: #

## 截图/演示
如有需要，添加截图或演示链接。
```

## 最佳实践

1. **分支命名**: 使用描述性的分支名称，如 `feature/user-auth` 或 `fix/login-bug`
2. **提交质量**: 确保提交信息清晰且原子化
3. **PR 大小**: 保持 PR 专注于单一功能或修复
4. **测试覆盖**: 确保适当的测试覆盖
5. **文档更新**: 及时更新相关文档

## 常见命令

```bash
# 查看远程仓库信息
git remote -v

# 查看可用的 PR 模板
ls .github/pull_request_template.md

# 创建并立即打开 PR 进行编辑
gh pr create --draft

# 查看现有 PR 列表
gh pr list

# 查看特定 PR 的详细信息
gh pr view <PR编号>
```

## 错误处理

如果遇到以下错误：

1. **未认证**: 运行 `gh auth login`
2. **分支未推送**: 运行 `git push -u origin HEAD`
3. **无上游分支**: 运行 `git push --set-upstream origin <分支名>`
4. **合并冲突**: 在创建 PR 前解决冲突

## 自动化脚本示例

```bash
#!/bin/bash
# 自动创建 PR 的脚本

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "有未提交的更改，请先提交所有更改"
    exit 1
fi

# 获取当前分支名
BRANCH_NAME=$(git branch --show-current)

# 推送分支
echo "推送分支 $BRANCH_NAME..."
git push -u origin HEAD

# 创建 PR
echo "创建 Pull Request..."
gh pr create --title "$1" --body "$2" --draft

echo "Pull Request 创建成功！"
```
