---
name: resolve-npm-vulnerabilities
description: Resolve npm vulnerabilities. Use when auditing and resolving vulnerabilities.
---

## Workflow

Do not run pnpm audit before performing this workflow.

1. Run the resolver script:
   ```bash
   bash .agents/skills/resolve-npm-vulnerabilities/scripts/resolve-npm-vulnerabilities.sh 
   ```

2. Fix build and type errors that are a result of the package updates.
3. In pnpm-workspace.yaml, only add this exclusion. Remove any added by the resolve-npm-vulnerabilities.sh
   minimumReleaseAgeExclude:
    - '@wisemen/*'
