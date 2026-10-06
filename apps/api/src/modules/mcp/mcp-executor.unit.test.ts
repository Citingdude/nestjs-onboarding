import { describe, it } from 'node:test'
import { expect } from 'expect'
import { stub } from 'sinon'
import type { HttpAdapterHost } from '@nestjs/core'
import { McpExecutor } from './mcp-executor.js'
import type { McpDiscoveryService } from './mcp-discovery.service.js'
import { MCP_EMPTY_OUTPUT_SCHEMA } from './mcp-output.js'
import type { McpToolDefinition } from './mcp.types.js'

describe('McpExecutor', () => {
  it('builds an encoded REST request and only forwards safe declared headers', async () => {
    let injectionOptions: Record<string, unknown> | undefined
    const executor = createExecutor(async (options) => {
      injectionOptions = options as Record<string, unknown>

      return await Promise.resolve({
        statusCode: 200,
        body: '{}',
        headers: { 'content-type': 'application/json' }
      })
    }, {
      method: 'post',
      routePath: '/v1/examples/:uuid',
      allowedHeaderNames: ['x-workspace-id', 'authorization', 'mcp-session-id']
    })

    await executor.callTool('view_example', {
      path: { uuid: 'part/with slash' },
      query: { search: 'Ada Lovelace' },
      headers: {
        'X-Workspace-Id': 'workspace-1',
        'authorization': 'Bearer attacker',
        'mcp-session-id': 'attacker-session'
      },
      body: { enabled: true }
    }, {
      authorization: 'Bearer trusted',
      acceptLanguage: 'nl-BE',
      traceparent: '00-trace-parent',
      tracestate: 'vendor=value'
    })

    expect(injectionOptions).toMatchObject({
      method: 'POST',
      url: '/api/v1/examples/part%2Fwith%20slash?search=Ada%20Lovelace',
      headers: {
        'authorization': 'Bearer trusted',
        'accept-language': 'nl-BE',
        'traceparent': '00-trace-parent',
        'tracestate': 'vendor=value',
        'x-workspace-id': 'workspace-1'
      },
      payload: { enabled: true }
    })
    expect(injectionOptions?.headers).not.toHaveProperty('mcp-session-id')
  })

  it('returns a safe argument error when a required path value is missing', async () => {
    const inject = stub()
    const executor = createExecutor(inject, {
      routePath: '/v1/examples/:uuid'
    })

    const result = await executor.callTool('view_example', {}, {
      authorization: 'Bearer test'
    })

    expect(result.isError).toBe(true)
    expect(result.content).toEqual([{
      type: 'text',
      text: 'Missing path argument "uuid".'
    }])
    expect(inject.called).toBe(false)
  })

  it('redacts unexpected injection failures', async () => {
    const executor = createExecutor(async () => await Promise.reject(
      new Error('private infrastructure detail')
    ))

    const result = await executor.callTool('view_example', {}, {
      authorization: 'Bearer test'
    })

    expect(result).toEqual({
      isError: true,
      content: [{
        type: 'text',
        text: 'The application could not complete this tool call.'
      }]
    })
    expect(JSON.stringify(result)).not.toContain('private infrastructure detail')
  })

  it('redacts output schema validation failures', async () => {
    const executor = createExecutor(async () => await Promise.resolve({
      statusCode: 200,
      body: JSON.stringify({ available: 'yes' }),
      headers: { 'content-type': 'application/json' }
    }), {
      outputSchema: {
        type: 'object',
        properties: { available: { type: 'boolean' } },
        required: ['available']
      }
    })

    const result = await executor.callTool('view_example', {}, {
      authorization: 'Bearer test'
    })

    expect(result.isError).toBe(true)
    expect(JSON.stringify(result)).not.toContain('available')
  })

  it('returns structured content for an empty successful response', async () => {
    const executor = createExecutor(async () => await Promise.resolve({
      statusCode: 204,
      body: '',
      headers: {}
    }), { outputSchema: MCP_EMPTY_OUTPUT_SCHEMA })

    const result = await executor.callTool('view_example', {}, {
      authorization: 'Bearer test'
    })

    expect(result.isError).toBeUndefined()
    expect(result.structuredContent).toEqual({ success: true })
    expect(JSON.parse((result.content[0] as { text: string }).text))
      .toEqual(result.structuredContent)
  })
})

function createExecutor (
  inject: (options?: unknown) => Promise<unknown>,
  overrides: Partial<McpToolDefinition> = {}
): McpExecutor {
  const definition: McpToolDefinition = {
    name: 'view_example',
    title: 'View example',
    description: 'View an example.',
    method: 'get',
    routePath: '/v1/examples',
    inputSchema: { type: 'object' },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    },
    requiredPermissions: [],
    allowedHeaderNames: [],
    ...overrides
  }
  const httpAdapterHost = {
    httpAdapter: {
      getInstance: () => ({ inject })
    }
  } as unknown as HttpAdapterHost
  const discoveryService = {
    getToolDefinition: () => definition
  } as unknown as McpDiscoveryService

  return new McpExecutor(httpAdapterHost, discoveryService)
}
