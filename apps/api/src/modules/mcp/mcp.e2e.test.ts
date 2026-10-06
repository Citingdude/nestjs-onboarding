import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { DEFAULT_NEGOTIATED_PROTOCOL_VERSION } from '@modelcontextprotocol/sdk/types.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

interface McpListToolsBody {
  result: {
    tools: McpToolPayload[]
  }
}

interface McpToolPayload {
  name: string
  title?: string
  description?: string
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
  annotations?: {
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
    openWorldHint?: boolean
  }
}

describe('MCP e2e test', () => {
  const MCP_ACCEPT_HEADER = 'application/json, text/event-stream'

  let setup: TestSetup
  let readContactUser: TestUser
  let updateContactUser: TestUser
  let adminUser: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    readContactUser = await setup.authContext.getUser([Permission.CONTACT_READ])
    updateContactUser = await setup.authContext.getUser([Permission.CONTACT_UPDATE])
    adminUser = await setup.authContext.getUser([Permission.ALL_PERMISSIONS])
  })

  after(async () => await setup.teardown())

  it('exposes only explicitly curated tools allowed for the principal', async () => {
    const readTools = await listTools(readContactUser.token)
    const readNames = toolNames(readTools.body as McpListToolsBody)

    expect(readTools).toHaveStatus(200)
    expect(readNames).toEqual([
      'view_contact_detail',
      'view_contact_index',
      'view_me'
    ])

    const updateTools = await listTools(updateContactUser.token)
    const updateNames = toolNames(updateTools.body as McpListToolsBody)

    expect(updateNames).toEqual(['update_contact', 'view_me'])

    const adminTools = await listTools(adminUser.token)
    const adminNames = toolNames(adminTools.body as McpListToolsBody)

    expect(adminNames).toEqual([
      'create_contact',
      'delete_contact',
      'update_contact',
      'view_contact_detail',
      'view_contact_index',
      'view_me'
    ])
    expect(adminNames).not.toContain('create_api_key')
    expect(adminNames).not.toContain('export_contacts')
    expect(new Set(adminNames).size).toBe(adminNames.length)
  })

  it('exposes stable metadata and input and output schemas', async () => {
    const response = await listTools(adminUser.token)
    const tools = (response.body as McpListToolsBody).result.tools
    const updateTool = tools.find(tool => tool.name === 'update_contact')
    const viewMeTool = tools.find(tool => tool.name === 'view_me')
    const deleteTool = tools.find(tool => tool.name === 'delete_contact')

    expect(updateTool).toMatchObject({
      title: 'Update contact',
      description: 'Replace editable fields on an existing contact.',
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false
      },
      inputSchema: {
        type: 'object',
        required: expect.arrayContaining(['path', 'body']),
        properties: {
          path: {
            type: 'object',
            required: expect.arrayContaining(['uuid']),
            properties: {
              uuid: expect.objectContaining({
                type: 'string',
                format: 'uuid'
              })
            }
          },
          body: expect.objectContaining({
            type: 'object',
            properties: expect.objectContaining({
              firstName: expect.objectContaining({
                type: 'string',
                nullable: true
              })
            })
          })
        }
      },
      outputSchema: {
        type: 'object',
        properties: { success: { type: 'boolean' } },
        required: ['success'],
        additionalProperties: false
      }
    })
    expect(viewMeTool?.outputSchema).toMatchObject({ type: 'object' })
    expect(deleteTool?.annotations?.destructiveHint).toBe(true)
  })

  it('runs tool calls through the REST authentication, permissions, and validation pipeline', async () => {
    const forbidden = await callTool(readContactUser.token, 'update_contact', {
      path: { uuid: '00000000-0000-4000-8000-000000000000' },
      body: {}
    })

    expect(forbidden).toHaveStatus(200)
    expect(forbidden.body.result.isError).toBe(true)
    expect(JSON.parse(String(forbidden.body.result.content[0].text)).errors).toBeDefined()

    const invalidUuid = await callTool(updateContactUser.token, 'update_contact', {
      path: { uuid: 'not-a-uuid' },
      body: {}
    })

    expect(invalidUuid).toHaveStatus(200)
    expect(invalidUuid.body.result.isError).toBe(true)
  })

  it('returns matching text and structured content for successful tool calls', async () => {
    const response = await callTool(readContactUser.token, 'view_me', {})

    expect(response).toHaveStatus(200)
    expect(response.body.result.isError).toBeUndefined()
    expect(response.body.result.structuredContent.uuid).toBe(readContactUser.user.uuid)
    expect(JSON.parse(String(response.body.result.content[0].text)))
      .toEqual(response.body.result.structuredContent)
  })

  it('advertises only tools and returns server instructions and identity', async () => {
    const response = await initializeClient(readContactUser.token)

    expect(response).toHaveStatus(200)
    expect(response.headers['mcp-session-id']).toBeUndefined()
    expect(response.body.result.capabilities.tools).toBeDefined()
    expect(response.body.result.capabilities.resources).toBeUndefined()
    expect(response.body.result.instructions.length).toBeGreaterThan(0)
    expect(response.body.result.serverInfo.name).toBe('NestJS Project Template')
    expect(response.body.result.serverInfo.version).not.toBe('0.0.0')
  })

  it('returns the configured CORS origin on raw MCP responses', async () => {
    const response = await createMcpPostRequest(readContactUser.token)
      .set('Origin', 'http://localhost:5173')
      .send({
        jsonrpc: '2.0',
        id: 'list-tools',
        method: 'tools/list',
        params: {}
      })

    expect(response).toHaveStatus(200)
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('returns 405 with the supported method for session-management endpoints', async () => {
    const getResponse = await request(setup.httpServer)
      .get('/api/v1/mcp')
      .set('Authorization', `Bearer ${readContactUser.token}`)
      .set('Accept', 'text/event-stream')

    expect(getResponse).toHaveStatus(405)
    expect(getResponse.headers.allow).toBe('POST')

    const deleteResponse = await request(setup.httpServer)
      .delete('/api/v1/mcp')
      .set('Authorization', `Bearer ${readContactUser.token}`)

    expect(deleteResponse).toHaveStatus(405)
    expect(deleteResponse.headers.allow).toBe('POST')
  })

  it('answers unauthenticated calls with an RFC 9728 auth challenge', async () => {
    const response = await request(setup.httpServer)
      .post('/api/v1/mcp')
      .set('Accept', MCP_ACCEPT_HEADER)
      .send({ jsonrpc: '2.0', id: 'list-tools', method: 'tools/list', params: {} })

    expect(response).toHaveStatus(401)

    const challenge = String(response.headers['www-authenticate'])
    const metadataUrl = /resource_metadata="([^"]+)"/.exec(challenge)?.[1]

    expect(challenge).toContain('Bearer')

    if (metadataUrl == null) {
      throw new Error(`No resource_metadata in challenge: ${challenge}`)
    }

    const parsed = new URL(metadataUrl)

    expect(parsed.port).not.toBe('')
    expect(parsed.pathname).toBe('/.well-known/oauth-protected-resource')
  })

  it('serves OAuth metadata and the configured OpenAI verification token at the origin root', async () => {
    for (const path of [
      '/.well-known/oauth-protected-resource',
      '/.well-known/oauth-protected-resource/api/v1/mcp'
    ]) {
      const response = await request(setup.httpServer).get(path)

      expect(response).toHaveStatus(200)
      expect(new URL(response.body.resource as string).pathname).toBe('/api/v1/mcp')
      expect(response.body.authorization_servers).toHaveLength(1)
      expect(response.body.scopes_supported).toContain('openid')
      expect(response.body.scopes_supported).toContain('offline_access')
      expect(response.body.bearer_methods_supported).toEqual(['header'])
    }

    const challenge = await request(setup.httpServer)
      .get('/.well-known/openai-apps-challenge')

    expect(challenge).toHaveStatus(200)
    expect(challenge.headers['content-type']).toContain('text/plain')
    expect(challenge.text).toBe('test-openai-apps-challenge-token')
  })

  async function initializeClient (token: string) {
    return await createMcpPostRequest(token)
      .send({
        jsonrpc: '2.0',
        id: 'initialize',
        method: 'initialize',
        params: {
          protocolVersion: DEFAULT_NEGOTIATED_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: 'mcp-e2e', version: '1.0.0' }
        }
      })
  }

  async function listTools (token: string) {
    return await createMcpPostRequest(token)
      .set('Mcp-Protocol-Version', DEFAULT_NEGOTIATED_PROTOCOL_VERSION)
      .send({
        jsonrpc: '2.0',
        id: 'list-tools',
        method: 'tools/list',
        params: {}
      })
  }

  async function callTool (
    token: string,
    name: string,
    argumentsPayload: Record<string, unknown>
  ) {
    return await createMcpPostRequest(token)
      .set('Mcp-Protocol-Version', DEFAULT_NEGOTIATED_PROTOCOL_VERSION)
      .send({
        jsonrpc: '2.0',
        id: `call-${name}`,
        method: 'tools/call',
        params: { name, arguments: argumentsPayload }
      })
  }

  function createMcpPostRequest (token: string) {
    return request(setup.httpServer)
      .post('/api/v1/mcp')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', MCP_ACCEPT_HEADER)
  }

  function toolNames (body: McpListToolsBody): string[] {
    return body.result.tools.map(tool => tool.name)
  }
})
