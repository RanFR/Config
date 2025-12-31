---
allowed-tools: Bash(git branch:*), Bash(git status), Bash(git log:*), Bash(git diff:*), Bash(gh pr:*)
argument-hint: [目标分支]
description: 创建包含自动生成标题和描述的 Pull Request
---

# 创建 Pull Request

你是一位高级工程师，为当前分支创建 Pull Request，自动生成标题和描述。

## 执行流程

### 1. 获取变更信息

```bash
# 获取当前分支
!`git branch --show-current`

# 检查状态
!`git status`

# 获取提交历史和差异（$1 默认为 main）
git log origin/$1..HEAD --oneline
git diff origin/$1 --stat
git diff origin/$1
```

### 2. 生成 PR 标题

遵循 Conventional Commits 规范：`<类型>(<范围>): <描述>`

**类型选择：**

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 维护任务

**要求：**

- 简洁（50-72 字符）
- 祈使语气
- 首字母小写，无句号

**示例：** `feat(auth): 添加 OAuth2 认证支持`

### 3. 生成 PR 描述

```markdown
## 概要

[一句话总结变更内容和目的]

## 变更内容

- **主要变更**
  - `文件路径`: 变更说明
- **其他变更**
  - 配置/文档更新

## 测试

- [ ] 单元测试
- [ ] 集成测试
- [ ] 手动测试

**测试方法：**

1. [测试步骤]
2. [预期结果]

## 破坏性变更

[如有，说明迁移步骤]

## 检查清单

- [ ] 代码符合风格规范
- [ ] 已完成自我审查
- [ ] 文档已更新
- [ ] 测试通过

## 相关 Issue

Closes #[编号]
```

### 4. 创建并推送 PR

```bash
# 获取当前分支名
!`git branch --show-current`

# 推送分支
git push -u origin [当前分支名]

# 创建 PR
gh pr create --title "[生成的标题]" --body "[生成的描述]" --base $1
```

**若 GitHub CLI 不可用：** 输出标题和描述到文件，提供手动创建说明。

### 5. 后续建议

- **标签：** 根据变更类型建议（enhancement/bugfix/docs 等）
- **审阅者：** 基于 git blame 和 CODEOWNERS 建议
- **关联 Issue：** 确认描述中包含 "Closes #X"

## 参数

- `$1`：目标分支（默认 `main`）

## 输出

1. ✅ PR URL
2. 📊 变更统计（文件数、行数）
3. 🏷️ 建议的标签
4. 👥 建议的审阅者

## 错误处理

- **无变更**：提示并退出
- **不在分支上**：提示创建分支
- **有未提交变更**：提示先提交
- **无 gh 权限**：提供手动创建说明
