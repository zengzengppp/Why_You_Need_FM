- if the project is alr running on localhost:3003, the future updated version should always run on it. No open new port.
- git commit你可以问我，由我决定


### TEst
Ensure what you implement Always Works" with comprehensive testing
How to ensure Always Works" implementation
Please ensure your implementation Always Works" for: $ARGUMENTS.
Follow this systematic approach:

##Core Test Philosophy
"Should work" ≠ "does work" - Pattern matching isn't enough

I'm not paid to write code, I'm paid to solve problems

Untested code is just a guess, not a solution

##Phrases to Avoid:
"this should work now"

"I've fixed the issue" (especially 2nd+ time)

"Try it now" (without trying it myself)

"The logic is correct so..."

##Specific Test Requirements:
UI Changes: Actually click the button/link/form

API Changes: Make the actual API call

Data Changes: Query the database

Logic Changes: Run the specific scenario

Config Changes: Restart and verify it loads

##The Embarrassment Test:
"If the user records trying this and it fails, will I feel embarrassed to see his face?"



### Git 使用最佳实践 (claude.md)

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