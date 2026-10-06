---
name: sync-with-template
description: Use when syncing upstream changes from a template repo into a derived repo (tenant project or downstream template) without clobbering repo-specific code, migrations, or the lockfile.
---

## Intent

Merge upstream changes from a **template repo** into the current repo, resolve conflicts on a best-effort
basis, and open a PR that honestly reports what was done and what could not be.

Assume **no human is reachable during the run**. Do not ask questions, do not wait for approval, do not
rely on plan mode — a headless runner may have a step *named* "plan" that only writes a plan and
advances. **The PR is the review gate.** Your job is to produce a reviewable PR, not an approved one.

## The seven rules

Everything else here is procedure. These are the rules — a sync that breaks one is worse than a sync
that stops early.

1. **Never hand-edit `pnpm-lock.yaml`.** Every hunk must come from a `pnpm install` run. If you find
   yourself editing a version, a resolution key, a snapshot body, or the lockfile's mirrored
   `overrides:`/`catalogs:` block — or repairing `node_modules` symlinks — stop.
2. **Never weaken our own dependency pin to make a check pass.** A downstream pin is usually deliberate
   (vulnerability fix, known-bad release); reverting or lowering it silently re-opens what it closed.
   Confirm intent with `git log -- <manifest>` before touching any pin.
   *Correcting a malformed override the template shipped is allowed* — e.g. a range unbounded on one side
   that captures a major version it was never meant to. Fix it in the manifest (never in the lockfile —
   see rule 1), keep the fix as narrow as the bug, and flag it in the PR body. The test is direction: are
   you restoring the override's intent, or dodging a failure by loosening our own constraint?
   Overrides live in `pnpm-workspace.yaml` (pnpm 11+) or root `package.json` — one written only into the
   lockfile is wiped by the next install and fails `--frozen-lockfile` in CI.
3. **Never hand-edit generated files — regenerate them.** This covers `apps/*/src/client/`,
   `openapi.json`, `i18n.generated.ts`, AsyncAPI/ERD output, and anything a scoped `AGENTS.md` marks as
   generated; check the closest guide for the list. Editing generated output to satisfy type-check is the
   same mistake as a cast: it compiles, ships, and is silently reverted by the next real regeneration.
   If you cannot find the generator command, that is a finding to report — not a licence to hand-edit.
   **Regenerate the API client whenever its dir exists, unconditionally**, even with zero client
   conflicts: the client is generated *from* the API you just merged, so upstream changes reach it only
   by regeneration. A client with no diff after an API-side merge is a red flag, not a no-op.
4. **Two-attempt cap.** If the same failure survives two fixes, stop and report it. Do not form a third
   theory. Repeated attempts on one dependency error is how a sync ends in a hand-patched, green-looking,
   unreproducible tree.
5. **Never auto-resolve migrations** (`**/migrations/**`) — timestamp ordering is not yours to decide.
6. **Report every check individually, and never claim a step you skipped.** A task that did not run is
   not a task that passed.
7. **Stay inside the sync.** Your remit is: land the upstream changes and get the tree working again. A
   bug you notice in template or repo code that the merge did not break is **not** yours to fix here —
   report it so it gets its own ticket. Mixing unrelated fixes into a 300-file merge hides them from
   review, which is where a sync PR gets its only scrutiny. If a pre-existing bug genuinely blocks the
   check gate, fix it as narrowly as possible, in its own commit, and say so in the PR body.

Never sync directly on `main`, and never assume `origin` is the template.

## Procedure

### 1. Preconditions

```bash
git status                       # clean tree; untracked files unrelated to the sync are fine
git switch -c chore/sync-template-$(date +%Y-%m)   # or reuse the ticket branch if already on one
```

### 2. Resolve the template

```bash
git remote get-url template 2>/dev/null   # if set, use as-is
```

If unset, add it for this run — `origin` may be Azure DevOps or a fork, so never assume it:

| Current repo | Upstream template |
|---|---|
| tenant project (`tcr-dex`, `atelier-couture`, …) | `wisemen-tenant-template` |
| `wisemen-tenant-template` | `nestjs-tenant-template` |
| `wisemen-project-template` | `nestjs-project-template` (root) |

`nestjs-project-template` is the root — it has no upstream and is never a sync target.

### 3. Read the changelogs

```bash
git fetch template
git ls-tree -r template/main --name-only | grep -i changelog   # enumerate the TREE; `git show
                                                               # template/main --name-only` lists only
                                                               # the tip commit and misses these
git show template/main:apps/api/CHANGELOG.md | head -150
```

Note breaking changes — they predict which check-gate failures are expected rather than introduced.

### 4. Merge

```bash
git merge template/main --no-ff --no-commit
git diff --name-only --diff-filter=U
```

### 5. Resolve, best effort

When a conflict's markers don't explain *why* the template changed it, read the intent:

```bash
git log --oneline main..template/main -- <file>   # upstream commits touching it
git log -- <file>                                # our side: was this a deliberate local decision?
```

Resolve at **file granularity** — never `git checkout --theirs/--ours` a whole directory; template
scaffold and repo-specific code coexist under `apps/` and `packages/`.

#### Resolution defaults

These are the decisions that recur every sync. Cite the rule you used in the PR body; a file matching no
rule is your own judgment call, which also goes in the PR body. Do not stretch a rule to a file it does
not name.

| Applies to | Resolution |
|---|---|
| `turbo.json`, `.github/workflows/`, `tsconfig*`, `eslint.config.*`, `knip.json`, `.npmrc`, `.nvmrc`, `Dockerfile`, `docker-compose.yaml`, `nats.conf` | **Theirs** |
| Anything only the template touched | **Theirs** |
| `apps/api/.env.test` | **Theirs**, then re-add any project-only vars ours had — test env tracks the template |
| `.gitignore`, `.dockerignore` | **Union** both sides, dedupe, drop markers. Taking theirs un-ignores project-specific paths and starts committing them |
| `.github/CODEOWNERS` | **Ours** — ownership is project-specific; the template's copy names template maintainers |
| Root `package.json` | **Ours.** Scripts here are project-specific; adopt a template script only by naming it individually |
| `.claude/settings.json` | **Ours**, then add any *new* template `permissions` entries and `hooks`. Never wholesale replace |
| `pnpm-workspace.yaml` catalog bumps | **Theirs**, except an entry the pin rules below protect |
| A dep version ours pinned **above** the template's range | **Ours.** A downstream bump is deliberate — usually a vulnerability fix — and the template's lower bound is a floor, not a target. Confirm with `git log -- <manifest>` and cite the commit |
| A dep version ours pinned **below** the template's | **Ours**, and flag it — may be a deliberate hold on a known-bad release |
| `apps/*/src/client/` | **Discard both** — step 7 regenerates it |
| `pnpm-lock.yaml` | **Skip** — step 6 regenerates it |

#### Flag in the PR body, don't silently decide

Resolve these only when the answer is genuinely unambiguous, and say either way in the PR body:

- Migrations (rule 5)
- Scaffold **modules** both sides edited (`contact`, `users`, `auth`, `roles`, …) — a blanket take-theirs
  across these is exactly what a past sync got wrong
- Repo-specific domain code that exists only on our side
- `CLAUDE.md` / `AGENTS.md`
- Anything a CHANGELOG flagged as a breaking change

**Watch for literal conflict markers from upstream.** The template may have *committed* marker text (a
CHANGELOG with `<<<<<<<` left in). These merge in as ordinary content, are not git conflicts, and never
appear in `--diff-filter=U`. The `git grep` in step 9 catches them; resolve by reading the surrounding
content — usually keep both sides, drop the markers.

### 6. Regenerate the lockfile

A plain `pnpm install` fails here: pnpm cannot parse a conflict-marked lockfile, and in a non-TTY it
aborts purging `node_modules`. Restore **ours** as a parseable base, then let install reconcile the new
manifests:

```bash
git checkout HEAD -- pnpm-lock.yaml
pnpm install --no-frozen-lockfile --config.confirmModulesPurge=false
pnpm install --frozen-lockfile        # must pass — proves lockfile ↔ manifests agree (rules 1 & 2)
```

### 7. Regenerate generated artifacts

Unconditional if the source exists (rule 3). The API client first — discover the script, it varies and is
often in `apps/web` rather than at root:

```bash
[ -d apps/web/src/client ] && pnpm turbo run web#openapi-ts   # or: pnpm --filter web generate:api-client
```

Then any other generated output the merge touched — `openapi.json`, localization types, AsyncAPI/ERD.
Check the closest `AGENTS.md` for what it marks as generated, and run the generator rather than editing
the artifact. If a generator has no discoverable command, leave the file as the merge left it and report
it in the PR body (rule 3) — do not hand-write generated output to clear a type error.

### 8. Commit the merge

`--no-verify` because the tree is knowingly not-yet-green here; the check gate is the real verification
and any fixes land as their own hooked commits.

```bash
git add pnpm-lock.yaml
[ -d apps/web/src/client ] && git add apps/web/src/client/
git commit --no-edit --no-verify
```

### 9. Check gate

```bash
git grep -n '<<<<<<<' -- .    # must be empty, incl. literal markers from upstream
node -e "console.log(Object.entries(require('./package.json').scripts||{}).join('\n'))"
```

Run **build, lint, type-check, test** and report each one separately (rule 6). Triage failures: regen and
auto-merged upstream renames can break repo-specific code that never conflicted.

- **Mechanical** (rename, call-site-only): fix it, commit separately.
- **Semantic** (behavior, shape, or a value that must be constructed): fix it properly or report it. Do
  not paper over it with a cast — supply the real value (`new ConfigService(process.env)`), not
  `{...} as unknown as ConfigService`. A cast compiles, passes your gate, and fails at runtime.
- **Pre-existing** (the merge didn't cause it): report it, don't fix it (rule 7). Only fix it if it
  actually blocks the gate, and then narrowly and in its own commit.
- Weakening our own dependency pin is never a fix (rule 2). Editing a generated file is never a fix
  (rule 3). Hitting the same failure twice means stop (rule 4).

### 10. PR

```bash
git push origin HEAD
TEMPLATE_NAME=$(basename -s .git "$(git remote get-url template)")
```

Title `chore: sync $TEMPLATE_NAME (YYYY-MM-DD)`. Follow the repo's git conventions for **structure** (in
this chain, the `api/git-conventions` skill: What / Why / How) — fit the content into those sections
rather than inventing new ones. Content:

- Merged commit list (`git log --oneline main..template/main`) and the merge-base SHA
- CHANGELOG summary and breaking changes
- **Every judgment call you made**, especially where no resolution default covered the file
- **Everything you flagged rather than decided** — migrations, domain code, breaking changes
- Per-task check-gate status, including anything that did not run and why
- Any downstream fixes applied

If a rule stopped you, the PR still opens — say what stopped you and where. **An honest PR reporting
three unresolved items is a success; a green PR that hid one is not.**

### 11. Feed corrections back

When review corrects a judgment call, and the correction would hold next time, add it to the *Resolution
defaults* table in the same PR. That is how a sync with twelve judgment calls becomes one with two, while
this skill stays short.

Add rules to the **root template** (`nestjs-project-template`), not only to the repo you are syncing —
this skill is itself synced downstream, so a rule added upstream reaches every derived repo, and a rule
added only downstream is overwritten by the next sync. Never add a rule for anything under *Flag in the PR
body*.

## Verify

- [ ] `git grep -n '<<<<<<<' -- .` is empty
- [ ] `pnpm install --frozen-lockfile` passes; no lockfile hunk was hand-authored
- [ ] No `overrides` entry in the lockfile lacking a matching entry in `pnpm-workspace.yaml` or root
      `package.json`
- [ ] No pin of ours weakened to make a check pass; any template override corrected is narrow and flagged
      (rule 2)
- [ ] Client regenerated if the dir exists, and its diff reviewed — an empty diff was investigated
- [ ] No generated file hand-edited — every generated artifact came from its generator, or was left alone
      and reported (rule 3)
- [ ] No fix used a cast or an invented value where a real one was constructible
- [ ] No unrelated bug fixed in passing; pre-existing issues reported, not folded in (rule 7)
- [ ] Migrations untouched by auto-resolution; timestamps still in order
- [ ] All four gate tasks reported individually — passed, failed, or not-run-and-why
- [ ] `.claude/` and `.agents/` tooling from the template incorporated
- [ ] PR opened against `main`, with every judgment call and every flagged item written down
