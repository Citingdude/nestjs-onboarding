import { type ArgumentsHost, type ExceptionFilter, Catch } from '@nestjs/common'
import { UnauthorizedApiError } from '@wisemen/api-error'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { HttpExceptionFilter } from '@wisemen/nestjs-http-exception-filter'
import { buildProtectedResourceMetadataUrl } from '#src/modules/mcp/oauth/mcp-resource-url.js'

/**
 * Turns a rejected token into a legible auth error for an MCP client. Bound at controller level
 * rather than globally: the global `AuthGuard` throws before the handler runs, and no other
 * endpoint should advertise this challenge.
 *
 * The body is delegated to the global filter so an MCP 401 stays byte-identical to every other
 * 401 — only the header is added.
 */
@Catch(UnauthorizedApiError)
export class McpAuthChallengeFilter implements ExceptionFilter {
  constructor (
    private readonly httpExceptionFilter: HttpExceptionFilter
  ) {}

  catch (error: UnauthorizedApiError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<FastifyRequest>()
    const reply = ctx.getResponse<FastifyReply>()
    const metadataUrl = buildProtectedResourceMetadataUrl(request)

    void reply.header('WWW-Authenticate', `Bearer resource_metadata="${metadataUrl}"`)

    this.httpExceptionFilter.catch(error, host)
  }
}
