# Backend Engineer Guidelines

> Single entrypoint for an **AI programmer agent** to operate in Wisemen’s backend stack: what to do, how to do it, and what “good” looks like.

## Glossary

* **CloudEvents**: standard envelope for event payloads.
* **Idempotent**: can run multiple times without changing end state.
* **JetStream**: NATS persistence layer (Streams/Consumers/KV/Object).
* **OpenTelemetry**: standard for tracing/metrics/logs.
* **PgBoss**: job queue on Postgres with retries/singletons/transactional enqueue.
* **SigNoz**: OTel-compatible APM backend.
* **Zitadel**: Auth provider; frontend PKCE, backend token validation.

## Assumptions
* Assume docker compose is running in the background.

## Scope & Principles

* Build with NestJS + TypeScript, TypeORM, and PNPM.
* Favor vertical slices: add self-contained modules/use-cases over spreading logic.
* Keep changes idempotent, observable, and reversible.
* Prefer idempotent writes and safe retries.
* Instrument and document: add observability, tests, and documentation annotations (swagger).
* Keep PRs small, focused, and linked to a ticket.

## Stack

* **Runtime**: Node.js + TypeScript (**pnpm**)
* **Framework**: NestJS (modular, DI-first)
* **Data**: PostgreSQL via TypeORM repositories & migrations
* **Messaging/Realtime**: NATS (+ JetStream persistence), WebSockets gateway
* **Background Jobs**: PgBoss (transactional enqueue, retries, singletons)
* **Cache/KV**: NATS KV (Redis legacy/transitioning)
* **Search**: Typesense (treated as derived data)
* **Auth**: Zitadel (frontend PKCE; backend JWT validation via JWKS)
* **Observability**: OpenTelemetry → SigNoz; errors & perf in Sentry
* **Containers/Orchestration**: Docker, Kubernetes
* **Object Storage**: S3 (binary assets, file uploads, backups)

## Environment & Tooling

**Workflow**:

Linear for tickets; GitHub for PRs, Figma for designs.

**Bootstrap**

```bash
pnpm install
cp .env.test .env
docker compose up -d
```

**Building**
```bash
pnpm build
```

**Linting**
```bash
pnpm lint
```

**Run entrypoints locally**

```bash
pnpm start:dev api
pnpm start:dev worker -- --queue=<name>
pnpm start:dev wss
pnpm start:dev cronjob -- <type>
```

> Local dependencies (postgrse, ...) are brought up with `docker compose up -d`

## Project Layout
* `src/entrypoints/`: application binaries — `api.ts`, `worker.ts`, `cronjob.ts`, `websocket-server.ts`.
* `src/app/`: domain/feature modules (controllers + use-cases live here).
* `src/modules/`: system/technical modules, integrations or clients (auth, files, mail, swagger, nats, redis, etc.).
* `src/utils/`: shared utilities,
* `src/sql/`: TypeORM datasources and migrations.
* `test/`: Node test runner setup, helpers, and fixtures.
* `docs/`: ERD and usage docs (e.g., file upload).

## Module anatomy

* A domain module contains the entities and one or multiple use cases.
* A new domain module should be added in the correct entrypoint `src/modules/api/api.module.ts`.
* Each domain follow the following structure:
  * `/domain-module/entities/`: TypeORM entities.
  * `/domain-module/events/`: domain events for traceability.
  * `/domain-module/errors/`: custom error classes.
  * `/domain-module/use-cases/`: independant use-cases.
  * `/domain-module/typesense/` (optional): Typesense collector/transformer.
  * `/domain-module/domain.module.ts`: glues everything together as a NestJS module.

> When creating a new feature, a new use-case should be created.

## Use case module

* Each use case exists as a independant nestjs module.
* A use case should be imported in the domain module `domain.module.ts`.
* A use case is located in `src/app/<domain>/use-cases/<action>/`.
* Each use case contains certain files:
  * `*.controller.ts`: DTO binding/validation/auth, calls a single use-case
  * `*.use-case.ts`: business logic
  * `*.repository.ts`: complex/custom queries
  * `*.command.ts`: body DTO
  * `*.query.ts`: querystring DTO
  * `*.response.ts`: response DTO
  * `*.event.ts`: domain event for traceability
  * `*.module.ts`: Nest wiring (imports/providers/exports)
  * `tests/*.use-case.unit.test`: Unit tests related logic in the `*.use-case.ts` file.
  * `tests/*.e2e.test`: End to End tests for related to the working of the endpoint.

> Module wiring: Import TypeOrmModule.forFeature([...]) with all entities touched (e.g., Contact, File); provide the use-case and repository; register the controller.

## Intake & Plan

* Read relevant code in the module(s) you’ll touch; identify entrypoints and dependencies.
* Confirm scope, constraints, acceptance criteria, and affected entrypoints.
* Propose a short plan with milestones/risks. Ask for missing context early.

## Implementation Rules

**Structure**

* Build **vertical slices**. Create/extend modules under src/app/<domain> for domain features; import any needed system modules from src/modules
* Keep controllers thin; put logic in use-cases. Only if a domain contains a lot of duplication between use-cases, you can move that logic to a service.

**Data**

* Use TypeORM repositories (via DI). Use the `api-database-migrations` skill for schema,
  backfill, and operational database transitions.
* Use transactions for multi-entity/state changes.

**APIs**

* Validate DTOs with `class-validator`; map errors via our exception model.
* Document with Swagger decorators; version via `/api/v1`.

**Background & Messaging**

* Long-running work → **PgBoss** job in a worker (idempotent + retries).
* Pub/Sub → **NATS** with clear subjects and privacy in mind.
* Realtime → publish to NATS; WSS relays to clients.

**Auth & Security**

* Never log secrets; sanitize/validate all inputs.

### Coding Style & Naming Conventions
* Language: TypeScript (ESNext, decorators). Indent 2 spaces.
* ESLint: `@wisemen/eslint-config-nestjs` + `eslint-plugin-unicorn`.
* Filenames: kebab-case enforced (unicorn/filename-case).
* Prefer PascalCase for classes/enums, camelCase for variables/functions, UPPER_SNAKE_CASE for env keys.
* Do explicit null checks `if (user == null) {}` instead of `if (user)` or `if (!user)`
* Make sure to respect the max-len rule and split long functions over multiple lines
* Spacing is important for eslint rules, take the examples above as guideline on how to space functions, params, ...
* Prefer guard statements with early exits over nesting if-statements.
* Break down complex, nested blocks of code into separate, smaller functions.

### Verification

* **Tests**: unit/integration/E2E as appropriate.
* **Observability**: logs/metrics/traces; ensure Sentry coverage.
* **Docs**: update this file or module README if the pattern changes.

### Commit & Pull Request Guidelines

* Create a commit for every task/step.
* Quality gate: run `pnpm lint` and `pnpm test:all` locally; update docs in `docs/` when applicable.

### Definition of Done

* Meets acceptance criteria with tests.
* Backward compatible or versioned.
* Secure by default (authz, validation, least privilege).
* Observable (Sentry + OTel traces/metrics where it matters).
* Documented (Swagger + docs) and operable (runbooks if needed).

## Core Technologies — How to Use Them

### Cache / KV

* Prefer **NATS KV** for small, fast key-value needs. Keep TTLs explicit.

### AuthN/Z (Zitadel)

* RBAC via roles/claims; mirror permissions server-side where needed.

### Observability (OTel, SigNoz, Sentry)

* **Sentry**: error reporting + performance sampling (`tracesSampleRate` per env).
* **SigNoz**: store and visualize traces/metrics; create dashboards & alerts.

## API Standards

* RESTful, resource-oriented routes; nouns, not verbs.
* Path versioning (default `v1`).
* DTO validation & serialization; consistent error envelopes.
* Swagger decorators on controllers; include examples and error shapes.
* Pagination/filtering/sorting via shared helpers.
* Don’t leak internal IDs/stack traces; align with `*.response.ts` contracts.

## Security & Reliability

* Secrets only in env/secret managers; never commit.
* Services expect config via env; no hardcoded URLs/credentials.
* Validate inputs & encode outputs; sanitize untrusted data.
* Idempotent writes; aim for exactly-once semantics where feasible.
* Transactions for multi-entity consistency.
* Circuit breakers, timeouts, retries with backoff at integration boundaries.
* Correlation IDs in logs; spans around all I/O.

## Continious learning
- If you learn something new add it to the AGENTS-SUGGESTIONS.md file.
