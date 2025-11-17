---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: 创建 Git 提交信息（commit）
---

## 上下文

- 当前 git 状态：!`git status`
- 当前 git 差异（已暂存和未暂存的更改）：!`git diff HEAD`
- 当前分支：!`git branch --show-current`
- 最近的提交：!`git log --oneline -10`

## 你的任务

1. 根据上述更改，创建一个单一的 Git 提交（commit）。
2. 建议提交信息包含以下内容：

   - 不超过 50 个字符的摘要
   - 详细描述
   - 受影响的组件
