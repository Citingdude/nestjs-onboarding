---
name: api-tests
description: Use when adding, updating, or reviewing tests in a backend API.
---

## Choose the smallest useful test

- Add a unit test when logic can be exercised through one class with stubbed collaborators.
- Add a suite of unit tests for use-cases, shared business logic classes and value objects and their collaborators.
- Add an end-to-end test when behavior depends on Nest wiring, auth, routing, serialization, database state, or module integration.
- Add a suite of end-to-end tests when implementing a new use-case with a http endpoint (controller).
- Add a suite of integration tests when implementing a new use-case which is not accessed through a http endpoint, but instead through jobs, domain event subscribers, messaging consumers (f.e. NATS).

## Best practices

- Prefer isolated tests. Tests should not influence others. Separate test setup, mock data, seeded data per test.
- Keep to the following test pattern: Arrange -> Act -> Assert.
- Only comment code where this would improve the readability of the test.
- Include the ticket number in the name of a regression test.
- Name tests so the following is clear: <when> <then>
- Prefer dynamic dates over static dates when setting up test context.

## Unit test pattern

- Use `node:test`, `expect`, and `sinon`.
- Call `TestBench.setupUnitTest()` in `before(...)`.
- Stub repositories and collaborators with sinon `createStubInstance(...)`.
- Use `stubDataSource()` when a use-case constructor requires a datasource.
- Assert behavior through existing and custom expect matchers.

Read `references/unit-tests.md` for examples.

## End-to-end test pattern

- Use `const setup = await TestBench.setupEndToEndTest()` in `before(...)`.
- Use `setup.authContext` to create or resolve test users.
- Use `request(setup.httpServer)` for HTTP assertions.
- Always `await setup.teardown()` in `after(...)` so the per-test-suite transaction is rolled back.
- Keep assertions at the API boundary: status, body, auth, simple validation, and observable persistence.
- Always include a test which verifies that a user without the correct permission receives a 403 response when the endpoint is not public.
- Do not test input validation that relies on class-validator. Custom validators need to be unit tested instead.

Read `references/end-to-end-tests.md` for examples

## Integration test pattern

- Use `const setup = await TestBench.setupModuleTest(...)` in `before(...)`.
- Get the entrypoint of the logic (f.e. JobHandler) through `setup.app.get(...)`.
- Always `await setup.teardown()` in `after(...)` so the per-test-suite transaction is rolled back.

Read `references/integration-tests.md` for examples

## Match repo conventions

- Put unit tests next to the use case under `tests/*.unit.test.ts`.
- Put endpoint coverage next to the use case under `tests/*.e2e.test.ts`.
- Put integration tests next to the use case under `tests/*.int.test.ts` (e.g. `*.repository.int.test.ts`).

## Commands

Run from `apps/<api>`:

```bash
pnpm test:all
pnpm test:one -- src/app/users/use-cases/set-user-roles/tests/set-user-roles.unit.test.ts
```

`test:one` builds first and then runs Node's test runner with a spec reporter. Pass a path, pattern, or other `node --test` arguments after `--`.
