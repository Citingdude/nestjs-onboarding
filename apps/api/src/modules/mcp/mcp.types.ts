import type { Tool, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'

export interface McpToolDefinition {
  name: string
  title: string
  description: string
  method: string
  routePath: string
  inputSchema: Tool['inputSchema']
  outputSchema?: Tool['outputSchema']
  annotations: NonNullable<ToolAnnotations>
  requiredPermissions: Permission[]
  allowedHeaderNames: string[]
}
