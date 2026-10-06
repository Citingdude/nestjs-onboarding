import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Post, Req, Res, UseFilters, Version, VERSION_NEUTRAL } from '@nestjs/common'
import { ApiExcludeController, ApiResponse } from '@nestjs/swagger'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import type { Implementation } from '@modelcontextprotocol/sdk/types.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { McpExecutor, type McpExecutionContext } from './mcp-executor.js'
import { MCP_SERVER_ICON_URL, MCP_SERVER_NAME, MCP_SERVER_VERSION } from './mcp-server-info.js'
import { MCP_INSTRUCTIONS } from './mcp-instructions.js'
import { McpAuthChallengeFilter } from './filters/mcp-auth-challenge.filter.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'

@ApiExcludeController()
@UseFilters(McpAuthChallengeFilter)
@Controller()
export class McpController {
  constructor (
    private readonly authContext: AuthContext,
    private readonly executor: McpExecutor
  ) {}

  @Post('mcp')
  @Version('1')
  async handlePost (
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown
  ): Promise<void> {
    const principal = this.authContext.getAuthOrFail()

    const executionContext: McpExecutionContext = {
      authorization: request.headers.authorization ?? '',
      acceptLanguage: request.headers['accept-language'],
      traceparent: this.asSingleHeader(request.headers.traceparent),
      tracestate: this.asSingleHeader(request.headers.tracestate)
    }
    const server = this.initMcpServer(principal, executionContext)
    const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true })

    reply.raw.on('close', () => {
      void Promise.allSettled([
        transport.close(),
        server.close()
      ])
    })

    // CORS is checked by api.ts, need to set the header manually because we work on a raw reply
    if (request.raw.headers.origin !== undefined) {
      reply.raw.appendHeader('Access-Control-Allow-Origin', request.raw.headers.origin)
    }

    await server.connect(transport)
    await transport.handleRequest(request.raw, reply.raw, body)
  }

  @Get('mcp')
  @Version(['1', VERSION_NEUTRAL])
  @ApiResponse({ status: HttpStatus.METHOD_NOT_ALLOWED })
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  @Header('Allow', 'POST')
  handleGet (): void {

  }

  @Delete('mcp')
  @Version(['1', VERSION_NEUTRAL])
  @ApiResponse({ status: HttpStatus.METHOD_NOT_ALLOWED })
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  @Header('Allow', 'POST')
  handleDelete (): void {

  }

  private initMcpServer (
    principal: AuthPrincipal,
    executionContext: McpExecutionContext
  ): McpServer {
    const server = new McpServer(
      this.buildServerInfo(),
      {
        capabilities: { tools: { listChanged: false } },
        instructions: MCP_INSTRUCTIONS
      }
    )

    server.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: await this.executor.listToolsForPrincipal(principal) }
    })

    server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await this.executor.callTool(
        request.params.name,
        request.params.arguments,
        executionContext
      )
    })

    return server
  }

  private buildServerInfo (): Implementation {
    return {
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
      ...MCP_SERVER_ICON_URL != null && {
        icons: [{ theme: 'light', mimeType: 'image/svg+xml', src: MCP_SERVER_ICON_URL }]
      }
    }
  }

  private asSingleHeader (value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value
  }
}
