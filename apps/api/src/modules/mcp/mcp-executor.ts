import { BadRequestException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js'
import type { JsonSchemaType, JsonSchemaValidator } from '@modelcontextprotocol/sdk/validation'
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv'
import type { FastifyInstance } from 'fastify'
import qs from 'qs'
import { McpDiscoveryService } from './mcp-discovery.service.js'
import { MCP_EMPTY_OUTPUT, MCP_EMPTY_OUTPUT_SCHEMA } from './mcp-output.js'
import type { McpToolDefinition } from './mcp.types.js'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'
import { GLOBAL_PREFIX } from '#src/modules/api/http-conventions.js'

export interface McpExecutionContext {
  authorization: string
  acceptLanguage?: string
  traceparent?: string
  tracestate?: string
}

class McpArgumentsError extends Error {}
type InjectionMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'
type StructuredContent = NonNullable<CallToolResult['structuredContent']>

@Injectable()
export class McpExecutor {
  private static readonly JSON_INDENT_SPACES = 2
  private static readonly FORBIDDEN_TOOL_HEADERS = new Set([
    'authorization',
    'connection',
    'content-length',
    'cookie',
    'host',
    'origin',
    'traceparent',
    'tracestate',
    'transfer-encoding'
  ])

  private readonly logger = new Logger(McpExecutor.name)
  private readonly jsonSchemaValidator = new AjvJsonSchemaValidator()
  private readonly outputValidators = new Map<string, JsonSchemaValidator<StructuredContent>>()

  constructor (
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly mcpDiscoveryService: McpDiscoveryService
  ) {}

  async listToolsForPrincipal (principal: AuthPrincipal): Promise<Tool[]> {
    return await this.mcpDiscoveryService.getToolsForPrincipal(principal)
  }

  async callTool (
    toolName: string,
    argumentsPayload: Record<string, unknown> | undefined,
    context: McpExecutionContext
  ): Promise<CallToolResult> {
    const definition = this.mcpDiscoveryService.getToolDefinition(toolName)

    if (definition == null) {
      throw new BadRequestException(`Unknown MCP tool: ${toolName}`)
    }

    try {
      const response = await this.getFastifyInstance().inject({
        method: this.toInjectionMethod(definition.method),
        url: this.buildUrl(definition, argumentsPayload),
        headers: this.buildHeaders(definition, argumentsPayload, context),
        ...this.buildPayload(argumentsPayload)
      })
      const responseValue = this.parseResponseBody(response.body, response.headers['content-type'])
      const isError = response.statusCode < HttpStatus.OK
        || response.statusCode >= HttpStatus.AMBIGUOUS
      const resultValue = !isError
        && definition.outputSchema === MCP_EMPTY_OUTPUT_SCHEMA
        ? MCP_EMPTY_OUTPUT
        : responseValue
      const content = [{
        type: 'text' as const,
        text: this.toReadableText(resultValue)
      }]

      if (isError || definition.outputSchema == null) {
        return {
          ...(isError ? { isError: true } : {}),
          content
        }
      }

      const validationResult = this.getOutputValidator(definition)(resultValue)

      if (!validationResult.valid) {
        this.logger.error(
          `MCP tool "${toolName}" returned invalid structured content: ${validationResult.errorMessage}`
        )

        return this.errorResult('The application could not complete this tool call.')
      }

      return {
        content,
        structuredContent: validationResult.data
      }
    } catch (error) {
      if (error instanceof McpArgumentsError) {
        return this.errorResult(error.message)
      }

      this.logger.error(
        `MCP tool "${toolName}" failed before receiving an API response.`,
        error instanceof Error ? error.stack : undefined
      )

      return this.errorResult('The application could not complete this tool call.')
    }
  }

  private getFastifyInstance (): FastifyInstance {
    return this.httpAdapterHost.httpAdapter.getInstance<FastifyInstance>()
  }

  private toInjectionMethod (method: string): InjectionMethod {
    const normalizedMethod = method.toUpperCase()

    switch (normalizedMethod) {
      case 'GET':
      case 'POST':
      case 'PUT':
      case 'PATCH':
      case 'DELETE':
      case 'OPTIONS':
      case 'HEAD':
        return normalizedMethod
      default:
        throw new Error(`Unsupported MCP route method "${method}".`)
    }
  }

  private buildUrl (
    definition: McpToolDefinition,
    argumentsPayload: Record<string, unknown> | undefined
  ): string {
    const pathArguments = this.asRecord(argumentsPayload?.path)
      ?? this.asRecord(argumentsPayload?.params)
      ?? {}
    const routePath = definition.routePath.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => {
      const value = pathArguments[name]

      if (!this.isPathValue(value)) {
        throw new McpArgumentsError(`Missing path argument "${name}".`)
      }

      return encodeURIComponent(String(value))
    })
    const query = this.asRecord(argumentsPayload?.query)
    const queryString = query == null
      ? ''
      : qs.stringify(query, { addQueryPrefix: true })

    return `/${GLOBAL_PREFIX}${routePath}${queryString}`
  }

  private buildHeaders (
    definition: McpToolDefinition,
    argumentsPayload: Record<string, unknown> | undefined,
    context: McpExecutionContext
  ): Record<string, string | string[]> {
    const headers: Record<string, string | string[]> = {
      authorization: context.authorization
    }

    if (context.acceptLanguage != null) {
      headers['accept-language'] = context.acceptLanguage
    }

    if (context.traceparent != null) {
      headers.traceparent = context.traceparent
    }

    if (context.tracestate != null) {
      headers.tracestate = context.tracestate
    }

    const suppliedHeaders = Object.fromEntries(
      Object.entries(this.asRecord(argumentsPayload?.headers) ?? {})
        .map(([name, value]) => [name.toLowerCase(), value])
    )

    for (const name of definition.allowedHeaderNames) {
      if (McpExecutor.FORBIDDEN_TOOL_HEADERS.has(name) || name.startsWith('mcp-')) {
        continue
      }

      const value = this.toHeaderValue(suppliedHeaders[name])

      if (value != null && headers[name] == null) {
        headers[name] = value
      }
    }

    return headers
  }

  private buildPayload (
    argumentsPayload: Record<string, unknown> | undefined
  ): { payload?: object | string } {
    if (
      argumentsPayload == null
      || !('body' in argumentsPayload)
    ) {
      return {}
    }

    const body = argumentsPayload.body

    return {
      payload: typeof body === 'object' && body != null
        ? body
        : JSON.stringify(body)
    }
  }

  private parseResponseBody (body: string, contentType: string | string[] | undefined): unknown {
    if (body.length === 0) {
      return null
    }

    const normalizedContentType = Array.isArray(contentType)
      ? contentType.join(';')
      : contentType ?? ''

    if (!normalizedContentType.includes('json')) {
      return body
    }

    try {
      return JSON.parse(body) as unknown
    } catch {
      return body
    }
  }

  private errorResult (message: string): CallToolResult {
    return {
      isError: true,
      content: [{ type: 'text', text: message }]
    }
  }

  private getOutputValidator (
    definition: McpToolDefinition
  ): JsonSchemaValidator<StructuredContent> {
    const existingValidator = this.outputValidators.get(definition.name)

    if (existingValidator != null) {
      return existingValidator
    }

    const validator = this.jsonSchemaValidator.getValidator<StructuredContent>(
      definition.outputSchema as JsonSchemaType
    )

    this.outputValidators.set(definition.name, validator)

    return validator
  }

  private isPathValue (value: unknown): value is string | number | boolean | bigint {
    return typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
      || typeof value === 'bigint'
  }

  private toHeaderValue (value: unknown): string | string[] | undefined {
    if (typeof value === 'string') {
      return value
    }

    if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
      return value
    }

    return undefined
  }

  private toReadableText (value: unknown): string {
    if (typeof value === 'string') {
      return value
    }

    if (value == null) {
      return 'null'
    }

    return JSON.stringify(value, null, McpExecutor.JSON_INDENT_SPACES)
  }

  private asRecord (value: unknown): Record<string, unknown> | undefined {
    if (typeof value === 'object' && value != null && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }

    return undefined
  }
}
