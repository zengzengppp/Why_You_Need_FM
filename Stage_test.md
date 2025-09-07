Git 使用最佳实践 (claude.md)

以下规范必须严格遵守，除非用户明确授权，否则 Claude 不得绕过。

⚠️ 安全原则

不可直接执行破坏性操作

在运行以下命令前，Claude 必须 先确认用户意图：

git restore

git reset

git clean

git rebase

git push --force

默认只提示用法，不自动执行。

任何可能导致数据丢失的命令，必须给出备份建议

例如：在 git restore . 前，先建议 git stash 或 git branch backup-<date>。

保持工作目录安全

如果本地有未提交更改，Claude 应提示：

先 git status 查看差异

再决定 commit / stash / discard