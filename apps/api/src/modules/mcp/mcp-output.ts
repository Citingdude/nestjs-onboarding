import type { Tool } from '@modelcontextprotocol/sdk/types.js'

export const MCP_EMPTY_OUTPUT = { success: true } as const

export const MCP_EMPTY_OUTPUT_SCHEMA: NonNullable<Tool['outputSchema']> = {
  type: 'object',
  properties: {
    success: { type: 'boolean' }
  },
  required: ['success'],
  additionalProperties: false
}
