---
name: api-database-migrations
description: Use when adding, reviewing, or modifying TypeORM schema migrations, persisted enum or value transitions, data backfills, or operational database changes.
---

# API Database Migrations

## Model the transition

Treat the entity as the target schema and the migration as the transition from the
deployed schema and data. Use a TypeScript/TypeORM migration for schema changes,
persisted enum or value changes, backfills, and operational database transitions.
For application transactions that only write existing tables, use the package-owned
TypeORM transaction guidance instead; keep `@wisemen/nestjs-typeorm` helper APIs upstream.

For a schema change, first bring the local `.env` database to the current migration
head, edit the entity mapping, generate the migration, and inspect every statement.
For any manual migration, still create the file through the TypeORM CLI first so the
filename and class name get a real generated timestamp before editing the contents.
Use a descriptive kebab-case name; the CLI adds the timestamp and class suffix.

```ts
import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddArchivedAt1783000000000 implements MigrationInterface {
  name = 'AddArchivedAt1783000000000'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" ADD "archived_at" TIMESTAMP(3)`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "archived_at"`)
  }
}
```

## Quick reference

| Intent | Repository-root command |
| --- | --- |
| Generate schema diff | `pnpm --dir apps/api typeorm migration:generate src/sql/migrations/<kebab-name>` |
| Create manual skeleton | `pnpm --dir apps/api exec typeorm migration:create src/sql/migrations/<kebab-name>` |
| Inspect status | `pnpm --dir apps/api typeorm migration:show` |
| Apply each migration transactionally | `pnpm --dir apps/api typeorm migration:run --transaction each` |
| Revert one migration | `pnpm --dir apps/api typeorm migration:revert --transaction each` |

Treat `migration:generate` as the schema starting point, not approval for destructive
or unrelated SQL. Use `migration:create` for data-only or operational transitions and
changes generation cannot express; still create the file through the CLI so the
timestamped filename comes from TypeORM, then normalize its skeleton to repository
imports and formatting.

## Review and rollout

- Reject unrelated schema drift. Examine drop/add sequences that should preserve data,
  enum/type changes, defaults, nullability, constraints/indexes, locks, and table rewrites.
- Define a safe rollout for populated-table renames, new `NOT NULL` constraints, large
  backfills, and continuously deployed incompatible changes. Use expand/backfill/contract
  when one release cannot remain backward-compatible. Require missing business backfill
  or rollback decisions; never invent them.
- Keep backfills deterministic and idempotent. Batch large work or move it outside a long
  migration transaction with an explicit operational plan.
- Never edit an applied or shared migration; add a corrective migration. Prefer raw SQL
  and migration-local constants over mutable current entities or domain code.
- Make `down` a safe inverse where possible. If no safe inverse exists, make the no-op
  explicit and document irreversibility, recovery, and data-loss risk.
- Verify on a disposable local database: run/revert/run when claiming reversibility,
  inspect final schema and data, then run affected build, type-check, and lint commands.

## Common mistakes

- Trusting generated SQL without comparing deployed and target states.
- Handwriting a migration filename or class timestamp instead of letting the TypeORM CLI
  create it first.
- Combining a large backfill and locking rewrite in one long transaction.
- Claiming a destructive `down` restores discarded data.
