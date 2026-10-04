---
description: Commit changes with a conventional commit message (uses git-commit skill)
argument-hint: "[type/scope or extra instructions]"
---

Commit the current changes using the `git-commit` skill.

Load the `git-commit` skill, then follow it exactly to:

1. Check `git status --porcelain` and analyze the diff (`git diff --staged`, or `git diff` if nothing is staged).
2. Stage files if needed (never stage secrets).
3. Generate a Conventional Commits message (`<type>[scope]: <description>`, description < 72 chars, imperative mood).
4. Create the commit and show me the final commit hash and message.

If no changes exist (nothing to commit), tell me instead of creating an empty commit.

Additional user instructions: ${ARGUMENTS:-none}
