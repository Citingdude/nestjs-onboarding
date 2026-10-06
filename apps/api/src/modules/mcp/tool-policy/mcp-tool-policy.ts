import type { Tool } from '@modelcontextprotocol/sdk/types.js'

export interface McpToolSubmissionExplanations {
  readOnly: string
  openWorld: string
  destructive: string
}

export interface ExposedMcpToolPolicy {
  exposure: 'exposed'
  title: string
  description: string
  annotations: NonNullable<Tool['annotations']>
  submission: McpToolSubmissionExplanations
}

export interface ExcludedMcpToolPolicy {
  exposure: 'excluded'
  reason: string
}

export type McpToolPolicy = ExposedMcpToolPolicy | ExcludedMcpToolPolicy

export interface PolicyOptions {
  openWorldReason?: string
  destructiveReason?: string
  idempotent?: boolean
}

export type McpToolBehavior = 'read' | 'additive' | 'update' | 'remove' | 'state'
type MutationKind = Exclude<McpToolBehavior, 'read'>

export interface McpToolOptions extends PolicyOptions {
  name: string
  title: string
  description: string
  behavior: McpToolBehavior
}

export function createMcpToolPolicy (options: McpToolOptions): ExposedMcpToolPolicy {
  if (options.behavior === 'read') {
    return readTool(options.title, options.description)
  }

  return mutateTool(options.title, options.description, options.behavior, options)
}

export function readTool (
  title: string,
  description: string
): ExposedMcpToolPolicy {
  return exposeTool(title, description, {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  }, {
    readOnly: 'This tool only retrieves application data and does not modify it.',
    openWorld: 'This tool only reads data held by the application and does not contact external services or people.',
    destructive: 'This tool does not create, update, delete, or otherwise alter data.'
  })
}

export function mutateTool (
  title: string,
  description: string,
  kind: MutationKind,
  options: PolicyOptions = {}
): ExposedMcpToolPolicy {
  const destructive = kind !== 'additive'
  const openWorld = options.openWorldReason != null

  return exposeTool(title, description, {
    readOnlyHint: false,
    destructiveHint: destructive,
    idempotentHint: options.idempotent ?? false,
    openWorldHint: openWorld
  }, {
    readOnly: 'This tool is not read-only because it creates or changes application data.',
    openWorld: options.openWorldReason
      ?? 'This tool only changes data held by the application and does not contact external services or people.',
    destructive: destructive
      ? options.destructiveReason ?? defaultDestructiveReason(kind)
      : 'This tool adds data or records an action without deleting or overwriting existing records.'
  })
}

export function excludeTool (reason: string): ExcludedMcpToolPolicy {
  return { exposure: 'excluded', reason }
}

function exposeTool (
  title: string,
  description: string,
  annotations: NonNullable<Tool['annotations']>,
  submission: McpToolSubmissionExplanations
): ExposedMcpToolPolicy {
  return {
    exposure: 'exposed',
    title,
    description,
    annotations,
    submission
  }
}

function defaultDestructiveReason (kind: Exclude<MutationKind, 'additive'>): string {
  switch (kind) {
    case 'update':
      return 'This tool overwrites fields on an existing application record.'
    case 'remove':
      return 'This tool removes or invalidates existing application data or access.'
    case 'state':
      return 'This tool changes an existing workflow state and may affect later operations.'
  }
}
