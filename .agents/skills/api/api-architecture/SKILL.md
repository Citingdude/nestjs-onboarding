---
name: api-architecture
description: Use when adding, reviewing, or explaining backend features in `apps/<api>`, tracing how controllers, use-cases, modules, repositories, jobs, domain events, and subscribers relate to each other, or deciding where new backend code belongs.
---

# API Architecture

## Vertical slicing

- `src/app` contains high level business concerns, often but not always related to aggregates or entities.
- Structure business logic in vertical slices.
- Vertical slices can contain a controller, use-case, repository, job, domain event subscriber, nats subscribers, nats consumers or other entrypoints into the slice.
- Domain events act as the communication medium between distinctly separate vertical slices and or aggregates. They act as an in process, transactional pub-sub pattern.
- Default to non-shared code, only when business logic is reused do we need to think about extracting it from use-cases into a business shared piece of logic. Even then, think about whether it's better to use the domain event flow to trigger the code, maybe we have identified a new smaller use-case.

## Use-case

- A use-case is the orchestrator of business logic.
- A use-case name should always be an actionable name like `view...`, `create...`, `sign...`, ....
- It coordinates transactions, infrastructure concerns and business logic.
- A use-case typically contains business logic where the logic is not shared and simple.
- A use-case defines what data it needs to operate as a query or command.
- A use-case is started by an entrypoint such as a controller, domain event subscriber, job handler, nats subscriber or nats consumer.
- Keep use-cases easy to test in isolation.
- Default to creating a dedicated use-case for any feature with persistence, side effects, or non-trivial business rules.
- Prefer `readonly(this.dataSource, async () => ...)` for `view...` use-cases and other read-only export/query flows that do not mutate state.

## Use-case entrypoints

- Use-case entrypoints do not handle business logic.
- Controllers: act as HTTP entrypoints.
- DomainEventSubscriber: act as entrypoint behind internal domain events.
- JobHandler: act as entrypoint behind async jobs (pg-boss).
- Nats subscriber/consumer: act as entrypoint behind NATS messages.

### Command, query, and response DTOs

- Use `*.command.ts` for operations that manipulate the system state.
- Use `query/*.query.ts` or `*.query.ts` for operations that query the system state.
- Use `*.response.ts` for responses.
- Treat these files as validation and serialization contracts, not business logic.

### Repository

- Add a use-case specific `*.repository.ts` for use-cases that modify application state and use-cases that have complex query logic.
- Prefer `insert` over `save` for new rows, and add idempotent existence-check helpers (e.g. `existsBy`) where a use-case needs to guard against duplicate writes.

### Module

- Treat each `*.module.ts` as Nestjs wiring for one slice.
- Import dependencies such as `TypeOrmModule.forFeature(...)` or client modules.
- Register the slice's controller, use-case, repository, handler, or subscriber.
- Import the slice module into its parent domain module.
- Separate into multiple modules if there are multiple use-case entrypoints. For example, add a `*.module.ts`, `*.api.module.ts` and `*.job.module.ts`.

### Domain Event

- Treat `*.event.ts` as a typed domain fact emitted after meaningful state changes.
- Emit domain events from the use-case.
- Domain events should reflect meaningful business changes, not necessarily database updates.
- Use events to decouple follow-up work.
- A use-case MUST emit domain events when some meaningful business change happens.

### Job and job handler

- Treat `*.job.ts` as the serializable background intent plus queue options.
- Treat `*.job-handler.ts` or `*.handler.ts` as the worker entrypoint.
- Keep handlers thin; they should delegate to a use-case.
- Register job modules in the appropriate queue module so the worker entrypoint loads them.

## Follow the three common flows

### HTTP flow

Use this mental model:

`Controller -> Command/Query DTO -> UseCase -> Repository/Service -> transaction(...) -> DomainEventEmitter -> Response`

Apply these rules:

- Default to one controller method calling one use-case method.
- Keep auth, permissions, and Swagger decorators in the controller.
- Keep business branching and state changes in the use-case.
- Wrap multi-write flows and write-plus-event flows in a transaction.
- Return typed responses from the boundary.

### Domain event-driven flow

Use this mental model:

`UseCase -> DomainEventEmitter -> Subscriber -> JobScheduler or secondary UseCase`

Apply these rules:

- Emit events from the same transactional unit as the state change when consistency matters.
- Use subscribers to fan out follow-up work instead of growing the original use-case indefinitely.
- Prefer subscribers for decoupled reactions such as notifications, integrations, indexing, or cache invalidation.
- Use jobs when follow up work can be performed asynchronously.

### Worker flow

Use this mental model:

`Job -> JobHandler -> UseCase`

Apply these rules:

- Model long-running or retryable work as jobs.
- Keep the job payload small and serializable.
- Keep the handler thin and reusable by delegating to a use-case.
- Make sure the job module is imported by a queue module that the worker bootstraps.

## Know where module wiring happens

- Read `apps/<api>/src/app.module.ts` for shared infrastructure that every entrypoint receives.
- Read `apps/<api>/src/modules/api/api.module.ts` for the HTTP-facing module graph.
- Read `apps/<api>/src/modules/domain-events/domain-event-subscribers.module.ts` for subscriber registration.
- Read `apps/<api>/src/modules/queue-modules/*.module.ts` plus `apps/api/src/entrypoints/worker.ts` for worker registration.
- Read the nearest parent domain module such as `notification.module.ts` or `one-signal.module.ts` to see which use-case modules belong to that slice.

## Decide where new code belongs

- Add a new HTTP feature by creating a use-case slice in the owning domain and importing its module into the parent domain module.
- Add a new use-case even when the slice is small if it owns business rules, persistence, or side effects.
- Add a domain event when a state change should be observable or trigger other flows.
- Add a subscriber when the follow-up action should be decoupled from the original use-case.
- Add a job when the work should run asynchronously, be retried, or avoid blocking the HTTP request.
