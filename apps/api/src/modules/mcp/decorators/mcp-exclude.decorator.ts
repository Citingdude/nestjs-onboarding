import { SetMetadata } from '@nestjs/common'
import { registerMcpExclusion } from '#src/modules/mcp/tool-policy/mcp-tool-registry.js'

export const MCP_EXCLUDE_KEY = 'mcp/exclude'

export interface McpExcludeOptions {
  name: string
  reason: string
}
type McpExclusion = string | McpExcludeOptions

export function McpExclude (exclusion: McpExclusion): ClassDecorator & MethodDecorator {
  const reason = typeof exclusion === 'string' ? exclusion : exclusion.reason

  if (reason.trim().length === 0) {
    throw new Error('MCP exclusions must include a reason.')
  }

  if (typeof exclusion !== 'string') {
    registerMcpExclusion(exclusion)
  }

  return SetMetadata(MCP_EXCLUDE_KEY, exclusion)
}

export function isMcpExcluded (target: (...args: unknown[]) => unknown): boolean {
  const metadata: unknown = Reflect.getMetadata(MCP_EXCLUDE_KEY, target)

  return typeof metadata === 'string' || isMcpExcludeOptions(metadata)
}

export function getMcpExclusion (
  target: (...args: unknown[]) => unknown
): McpExcludeOptions | undefined {
  const metadata: unknown = Reflect.getMetadata(MCP_EXCLUDE_KEY, target)

  return isMcpExcludeOptions(metadata) ? metadata : undefined
}

function isMcpExcludeOptions (value: unknown): value is McpExcludeOptions {
  if (typeof value !== 'object' || value == null) {
    return false
  }

  return 'name' in value && 'reason' in value
}
