---
name: git-conventions
description: Use when committing changes and creating for api PRs.
---

## Git messages

Use the following message format: 
<type>(<ticket>): <description>

where type is:
- feat: for features
- chore: for dependencies
- fix: for bugfixes
- docs: for documentation
- style: updates for formatting and linting issues
- refactor: for changes without changing functionality
- perf: for performance
- test: for extra tests

for example:
feat(TBN-123): short description of changes

## Pull Requests

Title: follow the same convention as git messages. 
<type>(<ticket>): <description>

Description: follow the following convention.

```md
## What
<short description with ticket reference>

## Why
<short description on what business or engineering goal this change achieves>

## How
<short description to draw attention to the significant design decisions, omit if none>
```

Try to be explicit and try to capture the changes in a few short, concise sentences that don’t require more than a few seconds to grasp

## Rules

Do not add a `Validation` section in the description.
