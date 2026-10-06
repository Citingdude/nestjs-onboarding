---
name: api-exports
description: Use when adding, reviewing, or modifying backend export flows in `apps/<api>`, including export request endpoints, export records, pg-boss jobs, generated files, export events, export types, and export index behavior.
---

# API Exports

## Default export flow

- Model exports as two slices:
  - a request slice that creates an `Export` row and schedules a pg-boss job
  - a worker slice that generates the file and completes or fails the export
- Follow the existing examples first:
  - `apps/api/src/app/contact/use-cases/export-contacts/`
  - `apps/api/src/modules/domain-event-log/use-cases/request-domain-event-log-export/`
  - `apps/api/src/modules/domain-event-log/use-cases/export-domain-event-log/`

## Request slice

- Keep the HTTP boundary fast. Do not generate the file in the controller request.
- The request use-case should:
  - create an `Export` entity with the correct `ExportType`
  - insert it inside `transaction(...)`
  - schedule a pg-boss job in the same transaction
  - return a typed response containing `exportUuid`
- For authenticated exports, get the requester from `AuthContext`.
- Prefer `POST .../export` endpoints for scheduling export work.

## Worker slice

- Keep the handler thin and delegate to the job use-case.
- In the job use-case:
  - load user preferences to choose the export language when applicable
  - create a `File` with the (translated) export filename
  - upload through `FileStorage`
  - persist the file and update the `Export` status in a transaction
  - emit `ExportSucceededEvent` or `ExportFailedEvent`
- Prefer stream-based export generation.
- Follow the export pattern:
  - repository returns a database stream
  - optionally, a `Transform` maps records to translated CSV rows
  - `CSV.encodeTransform()` encodes rows into CSV
  - `pipeline(...)` writes into `fileStorage.createUploadWritable(...)`
- Use batch-style fetching only when streaming is not practical.
- Wrap failure handling so the export row is moved to `FAILED` and the failure event is emitted.

## Data and serialization rules

- When adding a new export kind, update `ExportType` and add the matching migration.
- Do not pass HTTP command/query DTO instances directly into jobs. Copy the needed values into plain job data.

