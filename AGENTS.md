# Repository Agent Guide

## Scope and instruction routing

This guide applies to the whole repository. A closer `AGENTS.md` specializes it
for that subtree.

Before changing code:

1. Read `project-docs/README.md`. If the template has been initialized and
   `project-docs/requirements.md` or `project-docs/glossary.md` exists, read the
   parts relevant to the task before planning.
2. Read the closest scoped guide:
   - `apps/api/AGENTS.md` for the NestJS API, workers, and cronjobs.
3. Use matching skills for task-specific workflows. Keep always-on instructions
   here or in the closest scoped guide, not duplicated across skills.

## Repository map

- `apps/api/`: NestJS backend and its API, worker, cronjob, and supporting entrypoints.
- `packages/types/`: shared TypeScript types consumed through `@repo/types`.
- `docs/`: maintained repository documentation.
- `project-docs/`: client/project requirements after template initialization.
- `.agents/skills/`: repository-maintained skills and generated package skills.

## Commands

Use PNPM and run commands from the repository root unless a scoped guide says otherwise.

```bash
pnpm install
pnpm dev
pnpm build
pnpm type-check
pnpm lint
```

## Generated and derived files

- Do not edit `dist/` or other build output.
- Do not edit `apps/api/src/modules/localization/generated/i18n.generated.ts`;
  update localization resources and regenerate it through the API command.
- AsyncAPI HTML/YAML and ERD DBML files under `apps/api/dist/` are derived build output.
- `**/.agents/skills/packages@*` is generated from package-provided skills. Do not
  edit it directly. Other `.agents/skills/**` files are maintained in this repository.
- Change lockfiles only when the corresponding dependency manifest or resolved
  dependency set intentionally changes.

## Working and verification rules

- Preserve unrelated user changes and keep edits inside the requested scope.
- Follow existing code, configuration, and tests before older documentation or examples.
- Prefer the smallest relevant verification while iterating, then run every
  affected project's required build, type-check, lint, and test commands before completion.
- Never claim a command passed unless it was run and its current output was checked.
- Update the closest guide or skill when an accepted repository convention changes.
