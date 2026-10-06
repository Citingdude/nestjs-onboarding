import { describe, it } from 'node:test'
import { expect } from 'expect'
import { getRegisteredMcpExclusions, getRegisteredMcpTools } from './mcp-tool-registry.js'
import { createMcpToolPolicy } from './mcp-tool-policy.js'
import '#src/modules/api/api.module.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'
import { getMcpTool, McpTool } from '#src/modules/mcp/decorators/mcp-tool.decorator.js'

describe('MCP tool policy', () => {
  it('classifies the complete scaffold tool surface', () => {
    expect(getRegisteredMcpTools().map(tool => tool.name)).toEqual([
      'create_contact',
      'delete_contact',
      'update_contact',
      'view_contact_detail',
      'view_contact_index',
      'view_me'
    ])
    expect(getRegisteredMcpExclusions()).toHaveLength(0)
  })

  it('keeps undecorated methods out of the opt-in tool registry', () => {
    expect(getMcpTool(() => {})).toBeUndefined()
  })

  it('provides complete metadata for every exposed tool', () => {
    const incomplete = getRegisteredMcpTools()
      .filter(({ policy }) => policy.title.trim() === ''
        || policy.description.trim() === ''
        || typeof policy.annotations.readOnlyHint !== 'boolean'
        || typeof policy.annotations.openWorldHint !== 'boolean'
        || typeof policy.annotations.destructiveHint !== 'boolean'
        || typeof policy.annotations.idempotentHint !== 'boolean'
        || policy.submission.readOnly.trim() === ''
        || policy.submission.openWorld.trim() === ''
        || policy.submission.destructive.trim() === '')

    expect(incomplete).toEqual([])
  })

  it('derives conservative annotations from behavior presets', () => {
    expect(createMcpToolPolicy({
      name: 'read_example',
      title: 'Read example',
      description: 'Read an example.',
      behavior: 'read'
    }).annotations).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    })

    expect(createMcpToolPolicy({
      name: 'send_example',
      title: 'Send example',
      description: 'Send an example.',
      behavior: 'state',
      openWorldReason: 'This sends data to an external recipient.'
    }).annotations).toEqual({
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true
    })
  })

  it('rejects invalid, duplicate, and unexplained policies', () => {
    expect(() => McpTool({
      name: 'Not-valid',
      title: 'Invalid',
      description: 'Invalid tool name.',
      behavior: 'read'
    })).toThrow('Invalid MCP tool name')
    expect(() => McpTool({
      name: 'view_me',
      title: 'Duplicate',
      description: 'Duplicate an existing tool.',
      behavior: 'read'
    })).toThrow('Duplicate MCP tool name')
    expect(() => McpExclude('')).toThrow('MCP exclusions must include a reason')
  })
})
