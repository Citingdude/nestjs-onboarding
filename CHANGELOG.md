## Use @wisemen/nestjs-zitadel package

### Description
Replaced the in-repo `apps/api/src/modules/zitadel` client with the published `@wisemen/nestjs-zitadel` package (`0.1.0`). The module is now registered via `ZitadelModule.forRootAsync` (wrapped in `DefaultZitadelModule`) instead of reading `ConfigService` internally. Dropped the now-unused `@connectrpc/connect`, `@connectrpc/connect-node`, and `@zitadel/client` dependencies; `@zitadel/proto` is still a direct dependency since app code imports its types.

### Migration
Replace imports of `#src/modules/zitadel/zitadel.client.js`, `zitadel.types.js`, and `errors/zitadel.error.js` with `@wisemen/nestjs-zitadel`. Import `ZitadelModule.forRootAsync` (or a wrapper module like `DefaultZitadelModule`) wherever `ZitadelClient` is injected, reading `ZITADEL_BASE_URL`, `ZITADEL_API_TOKEN`, and `ZITADEL_ORGANISATION_ID` via `ConfigService`. Then run `pnpm install`.

## Node.js 26 upgrade

### Description
Updated the template runtime to Node.js 26.

### Migration
Update local development, CI, and deployment environments to Node.js 26, then rebuild application images.

## Local ZITADEL mail and database readiness

### Description
Configured the local ZITADEL Compose service with Mailpit SMTP settings and delayed ZITADEL startup until PostgreSQL is healthy plus an additional two-second readiness gate.

### Migration
Restart the local Compose stack. Existing ZITADEL instances must keep or recreate their SMTP provider in the console because default-instance settings apply only during initial setup.

## Generic domain event log actor (TBN-2004)

### Description
Domain event logs now record the actor as a generic `actorType`/`actorId` pair instead of a `userUuid` column, so events triggered by API keys (and future non-user actors) can be attributed instead of being logged with a null actor. The index endpoint's `userUuids` filter is replaced by `actorTypes` and `actorIds` filters, and its response returns `actorType`/`actorId` instead of `userUuid`.

### Migration
Update any code or dashboards reading the domain event log `userUuid` field or the `userUuids` filter to use `actorType`/`actorId` and the `actorTypes`/`actorIds` filters instead. Run the new `DomainEventLogActor1790678686000` migration, which backfills `actor_type: 'user'` and `actor_id` from the existing `user_uuid` column before dropping it.

## Auth module refactor

### Description
Consolidated API-key, permission, role, and user authentication code under the auth module, with separate authentication, authorization, context, and permission components. Updated `@wisemen/nestjs-auth` to `0.2.2` and `@wisemen/nestjs-jwt-verifier` to `0.2.0` to support the refactored structure.

### Migration
Update custom API imports from `#src/app/api-key`, `#src/app/roles`, `#src/app/users`, and `#src/modules/permission` to their equivalents under `#src/modules/auth`. Update imports of the auth context and guard to their new `context` and `authentication/guard` paths, then run `pnpm install`.

## Structured audit fields (TBN-1794)

### Description
API access audit records now store the actor as separate, filterable `actor.id` and `actor.type` attributes instead of one JSON-serialized `actor` string, so audit logs can be filtered and grouped by actor. Unauthenticated requests are recorded with `actor.type` `anonymous`, and API-key requests also carry `actor.api_key_uuid`. Records additionally capture the client IP as `client.address` and the user agent as `user_agent.original`, following OpenTelemetry semantic conventions.

### Migration
Update any log queries, dashboards, or alerts that read the `actor` attribute to use `actor.id` and `actor.type` instead.

## Zitadel user impersonation

### Description
Added a `POST /api/v1/impersonation` endpoint that lets users with the new `user.impersonate`
permission obtain a Zitadel access token for another user via OAuth token exchange. Targets with a
system-admin role, `ALL_PERMISSIONS`, or `user.impersonate` cannot be impersonated. Each
impersonation emits a `user.impersonated` domain event for auditing.

### Migration
Create a Zitadel service user with the impersonator role, enable token exchange and impersonation
in the Zitadel instance security settings, and configure its credentials in
`ZITADEL_IMPERSONATION_CLIENT_ID` and `ZITADEL_IMPERSONATION_CLIENT_SECRET`. Grant the
`user.impersonate` permission to the roles that should be allowed to impersonate.

## Reduce AGENTS.md duplication with skills

### Description
Trimmed `apps/api/AGENTS.md` from 702 to 217 lines by removing content already covered by a
skill, and extracted the feature-scaffolding example plus MCP tools/Controllers guidance into new
repo-local skills. Bumped `@wisemen/pgboss-nestjs-job`, `nestjs-nats`, `nestjs-domain-events`, and
`decorators` to versions that ship their own AI coding skills (see wisemen-core#1735), and bumped
`@wisemen/skills-cli` to `0.2.0`, simplifying the `postinstall` sync command now that it
auto-discovers workspace member projects.

### Migration
None

## Local test-user insertion script

### Description
Added an idempotent local API script and VS Code task to create or update a Zitadel-backed system-admin test user and refresh its role cache.

### Migration
None

## Domain event log archiving

### Description
Added an `archive-domain-event-logs` cronjob that exports domain event logs to NDJSON archives in file storage, records the archived ranges, and removes the archived logs from the database.

### Migration
Run the API database migrations before deploying. Configure a scheduled invocation of the `archive-domain-event-logs` cronjob with its required `--max-range` duration.

## Legacy Docker deploys (TBN-1440)

### Description
Updated the API Docker build to use PNPM's legacy deploy mode, restoring production image builds that fail with the current workspace deployment behavior.

### Migration
None

## NPM vulnerability fixes (TBN-1939)

### Description
Updated Fastify and Undici dependency overrides to resolve reported NPM vulnerabilities.

### Migration
None

## Auth module cleanup

### Description
Removed unused JWKS and JWT configuration from the auth module, and registered the global JWT configuration in the public-file download module where it is used.

### Migration
None

## API and worker development command

### Description
Added `pnpm dev:worker` to run the supervised system and NATS outbox worker, and updated `pnpm dev` to start it alongside the API.

### Migration
None

## Danger CI checks

### Description
Added Danger checks to the CI pipeline.

### Migration
None

## File storage and Typesense grouping

### Description
Extracted the S3 implementation into the `@wisemen/nestjs-file-storage` package and added Typesense grouping support.

### Migration
None

## Pgboss and date utilities

### Description
Updated Pgboss packages to use `forRoot` and `forRootAsync` initialization, and replaced `time` and `wisedate` with `datewise`.

### Migration
None

## Controller metadata and user synchronization

### Description
Moved controller paths and versions to method decorators and added Zitadel user-data synchronization after user creation.

### Migration
None

## NATS bootstrap

### Description
Reworked the NATS NestJS framework so it can be bootstrapped without decorated classes.

### Migration
None

## Feature flags and API conventions

### Description
Added feature flags, standardized OpenAPI tag names, made `mockAuth` type-safe, updated Docker Compose to use named volumes and configs, and replaced `rm -rf` with a Windows-compatible package.

### Migration
None

## User-role cache invalidation

### Description
Added the `USER_ROLES_SET` event when user roles are updated and a subscriber that clears the user-role cache. ([#401](https://github.com/wisemen-digital/nestjs-project-template/pull/401))

### Migration
None

## Typesense search parameters

### Description
Added `addSearchOn` to the Typesense search parameter builder input.

### Migration
None

## AsyncAPI and test setup

### Description
Added AsyncAPI documentation generation; improved integration-test setup; added API properties to `IntegrationEvent`; made controller versioning explicit; changed `no-magic-numbers` to a warning; and made AsyncAPI channel discovery use a glob pattern.

### Migration
Replace `TestBench.setupRepositoryTest` with `TestBench.setupEndToEndTest` or `TestBench.setupIntegrationTest`. Replace `EndToEndTestSetup` and `RepositoryTestSetup` with `TestSetup`.

## Magic-number linting

### Description
Added the `no-magic-numbers` lint rule.

### Migration
None

## Dependency release age and UUID branding

### Description
Added an `.npmrc` minimum release age for packages and standardized the `Uuid` brand to `'uuid'` so UUIDs exported by packages remain compatible.

### Migration
None

## NATS context propagation

### Description
Added context propagation to NATS events and updated `@wisemen/pgboss-nestjs-job` to version 1.1.9 to extract active context from jobs and events.

### Migration
None

## README improvements

### Description
Improved the README structure and setup instructions for clarity. [TBN-287](https://linear.app/wisemen/issue/TBN-287/fatsoenlijke-readme)

### Migration
None

## Changelog structure

### Description
Added an initial changelog structure.

### Migration
None
