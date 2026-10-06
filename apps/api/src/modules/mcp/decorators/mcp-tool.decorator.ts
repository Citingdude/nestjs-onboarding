import { SetMetadata } from '@nestjs/common'
import { createMcpToolPolicy } from '#src/modules/mcp/tool-policy/mcp-tool-policy.js'
import type { McpToolOptions } from '#src/modules/mcp/tool-policy/mcp-tool-policy.js'
import {
  assertValidMcpToolName,
  registerMcpTool
} from '#src/modules/mcp/tool-policy/mcp-tool-registry.js'
import type { RegisteredMcpTool } from '#src/modules/mcp/tool-policy/mcp-tool-registry.js'

export const MCP_TOOL_KEY = 'mcp/tool'

export function McpTool (options: McpToolOptions): MethodDecorator {
  assertValidOptions(options)

  const metadata: RegisteredMcpTool = {
    name: options.name,
    policy: createMcpToolPolicy(options)
  }

  registerMcpTool(metadata)

  return SetMetadata(MCP_TOOL_KEY, metadata)
}
export function getMcpTool (
  target: (...args: unknown[]) => unknown
): RegisteredMcpTool | undefined {
  const metadata: unknown = Reflect.getMetadata(MCP_TOOL_KEY, target)

  return isRegisteredMcpTool(metadata) ? metadata : undefined
}

function assertValidOptions (options: McpToolOptions): void {
  assertValidMcpToolName(options.name)

  if (options.title.trim().length === 0) {
    throw new Error(`MCP tool "${options.name}" must have a title.`)
  }

  if (options.description.trim().length === 0) {
    throw new Error(`MCP tool "${options.name}" must have a description.`)
  }

  if (options.openWorldReason != null && options.openWorldReason.trim().length === 0) {
    throw new Error(`MCP tool "${options.name}" has an empty open-world explanation.`)
  }

  if (options.destructiveReason != null && options.destructiveReason.trim().length === 0) {
    throw new Error(`MCP tool "${options.name}" has an empty destructive explanation.`)
  }
}

function isRegisteredMcpTool (value: unknown): value is RegisteredMcpTool {
  if (typeof value !== 'object' || value == null) {
    return false
  }

  return 'name' in value && 'policy' in value
}
