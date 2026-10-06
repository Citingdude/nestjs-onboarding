---
name: typeorm-transactions
description: This skill should be used when writing or reviewing code that uses database transactions, readonly replica queries, pessimistic locking, or TypeORM repository operations inside a transactional or readonly context. Applies when adding `transaction()` or `readonly()` calls, using `pessimistic_write` locks, or fetching relations inside a transaction.
---

# TypeORM Transactions And Readonly Contexts

## Import

Import `transaction` and `readonly` from `@wisemen/nestjs-typeorm`, not from TypeORM directly. Inject `DataSource` in the constructor alongside any repositories that participate in the transaction or readonly flow.

```ts
import { InjectRepository, readonly, transaction, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'

constructor (
  private readonly dataSource: DataSource,
  @InjectRepository(MyEntity)
  private readonly myEntityRepository: TypeOrmRepository<MyEntity>,
) {}
```

## Default decision

- Prefer `readonly(this.dataSource, async () => ...)` for use-cases and job steps that only query data for frontend responses, exports, or other read-only flows.
- Prefer `transaction(this.dataSource, async () => ...)` for any flow that writes state, emits domain events tied to writes, or needs row locks.

## How the wrappers work

`transaction()` uses `AsyncLocalStorage` to track the active transaction manager. If called while already inside a transaction, it reuses the existing one — nested calls are safe. Repositories injected via `@InjectRepository` participate in the active transaction automatically through a proxy; never pass the `EntityManager` callback argument into them manually.

`readonly()` uses the same repository proxy mechanism, but binds repository calls to the readonly connection for the lifetime of the callback only.

## Basic readonly usage

```ts
return await readonly(this.dataSource, async () => {
  return await this.contactRepository.findMany(query)
})
```

## Basic transaction usage

```ts
await transaction(this.dataSource, async () => {
  await this.myEntityRepository.update({ uuid }, { status: Status.DONE })
  await this.otherService.doSomething(uuid)
})
```

## Pessimistic locking with relations

TypeORM does not allow `lock: { mode: 'pessimistic_write' }` and `relations` in the same `find` or `findOne` call. Always split into two queries inside the transaction:

1. Lock the row without relations.
2. Fetch relations using `lockedEntity.uuid`.

```ts
await transaction(this.dataSource, async () => {
  const lockedEntity = await this.myEntityRepository.findOne({
    where: { uuid },
    lock: { mode: 'pessimistic_write' },
  })

  if (lockedEntity == null) {
    throw new MyEntityNotFoundError(uuid)
  }

  const entity = await this.myEntityRepository.findOne({
    where: { uuid: lockedEntity.uuid },
    relations: {
      payment: true,
      lines: true,
    },
  })

  if (entity == null) {
    throw new MyEntityNotFoundError(uuid)
  }

  // work with entity
})
```

Null-check both queries separately — they are distinct SQL statements even though they target the same row. Use `lockedEntity.uuid` (not the original input parameter) for the second query to guarantee lock and data read refer to the same row.

## Rules

- Throwing inside the callback rolls back the transaction.
- Do not call `transaction()` inside a readonly context — the wrapper throws.
- Do not combine `lock` and `relations` in one `findOne`.
