import type { ExposedMcpToolPolicy } from './mcp-tool-policy.js'

export interface RegisteredMcpTool {
  name: string
  policy: ExposedMcpToolPolicy
}
export interface RegisteredMcpExclusion {
  name: string
  reason: string
}

const registeredTools = new Map<string, RegisteredMcpTool>()
const registeredExclusions = new Map<string, RegisteredMcpExclusion>()
const MCP_TOOL_NAME_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/
const MCP_TOOL_NAME_MAX_LENGTH = 64

export function registerMcpTool (tool: RegisteredMcpTool): void {
  assertValidMcpToolName(tool.name)
  assertUniqueName(tool.name)
  registeredTools.set(tool.name, tool)
}

export function registerMcpExclusion (exclusion: RegisteredMcpExclusion): void {
  assertValidMcpToolName(exclusion.name)
  assertUniqueName(exclusion.name)
  registeredExclusions.set(exclusion.name, exclusion)
}

export function getRegisteredMcpTools (): RegisteredMcpTool[] {
  return [...registeredTools.values()]
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function getRegisteredMcpExclusions (): RegisteredMcpExclusion[] {
  return [...registeredExclusions.values()]
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function assertValidMcpToolName (name: string): void {
  if (!MCP_TOOL_NAME_PATTERN.test(name) || name.length > MCP_TOOL_NAME_MAX_LENGTH) {
    throw new Error(`Invalid MCP tool name "${name}".`)
  }
}

function assertUniqueName (name: string): void {
  if (registeredTools.has(name) || registeredExclusions.has(name)) {
    throw new Error(`Duplicate MCP tool name "${name}".`)
  }
}
