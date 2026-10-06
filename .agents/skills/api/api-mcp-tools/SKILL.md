---
name: api-mcp-tools
description: Use when exposing a controller method as an MCP tool, adding `@McpTool`/`@McpExclude`, or reviewing which routes should be callable through the MCP connector.
---

# API MCP Tools

The MCP connector at `POST /api/v1/mcp` (`src/modules/mcp/`) exposes only controller methods
deliberately annotated with `@McpTool({...})`.

* Choose stable snake_case names that describe a user goal. Renaming a controller does not rename
  its tool, but changing the authored tool name is a breaking plugin contract.
* Provide a concise user-facing title and description, select the correct behavior preset, and
  explain destructive or open-world effects. Use a reasoned `@McpExclude('...')` for technical
  controllers that must never become tools.
* Review permissions, privacy, confirmation needs, retry safety, and external effects before
  exposing a route. Public, Swagger-excluded, credential-producing, binary-transfer, operational,
  and real-notification endpoints are not suitable by default.
* Swagger route and DTO metadata becomes the tool input and output schema. Use explicit
  `type`, `items`, `format`, `nullable`, and useful descriptions; define exactly one successful
  response shape.
* MCP calls are injected through the Fastify HTTP adapter. The normal authentication and permission
  guards, scope checks, pipes, interceptors, filters, and serialization therefore remain
  authoritative; do not duplicate them in the MCP executor.
* Server identity lives in `mcp-server-info.ts` and the per-session `instructions` string in
  `mcp-instructions.ts`. Both ship as template placeholders and should be filled in per project.
