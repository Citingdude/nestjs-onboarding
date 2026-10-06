---
name: api-controllers
description: Use when writing or reviewing a NestJS controller in this repo — thin-controller shape, status codes, permission enforcement, route params, and routing/naming conventions.
---

# API Controllers

* Thin controllers only:
  * validate the DTOs (command (body), query, response),
  * verify auth and permissions using guards,
  * call a single use-case.
* Status codes: **201** for creates (return a typed `*.response.ts`), **200** for reads, **204**
  for updates/deletes (`@HttpCode(HttpStatus.NO_CONTENT)`).
* DTO binding: `@Body()` for `*.command.ts`, `@Query()` for `*.query.ts`.
* Get identity via **`AuthContext`** inside the controller/use-case for endpoints like `/users/me`.
* Route params: use `@UuidParam('<param>')` (from `@wisemen/decorators`) with **typed UUID
  aliases** (e.g. `ContactUuid`, `UserUuid` — the `Uuid<'Brand'>` branded-type pattern), not a
  bare `string`.

## Permissions

* Enforce with `@Permissions(Permission.<DOMAIN_ACTION>)` on the route.
* The `Permission` enum lives in `src/modules/permission/permission.enum.ts`; add new values
  there and keep role mappings in sync where applicable.
* Guard implementation: `src/modules/permission/guards/permission.guard.ts`.

## Routing Patterns

* List vs detail: `GET /<plural>` with `@Query()` DTO; `GET /<plural>/:uuid` with
  `@UuidParam('uuid')`.
* Nested resources: use explicit segments (e.g., `users/:userUuid/role`) and align permission
  enums accordingly.
* Naming: prefer plural nouns for collection routes; keep entity names singular in code.
