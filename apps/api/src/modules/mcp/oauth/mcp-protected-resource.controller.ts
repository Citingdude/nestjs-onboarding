import { Controller, Get, Req, Version, VERSION_NEUTRAL } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { Public } from '@wisemen/nestjs-auth'
import type { FastifyRequest } from 'fastify'
import { McpOAuthConfig } from './mcp-oauth.config.js'
import { buildMcpResourceUrl } from './mcp-resource-url.js'

interface ProtectedResourceMetadata {
  resource: string
  authorization_servers: string[]
  scopes_supported: string[]
  bearer_methods_supported: string[]
}

/**
 * RFC 9728 protected resource metadata. An MCP client that gets a 401 follows the
 * `resource_metadata` URL from the `WWW-Authenticate` header to here, and learns which
 * authorization server to send the user to. Without it the client guesses OAuth endpoints at the
 * origin and dies parsing the 404.
 *
 * Both paths are served because clients differ on whether they append the resource path. The
 * global `api` prefix is excluded for both in `modules/api/http-conventions.ts` — the spec puts
 * them at the origin root.
 */
@ApiExcludeController()
@Controller()
export class McpProtectedResourceController {
  constructor (
    private readonly config: McpOAuthConfig
  ) {}

  @Public()
  @Get('.well-known/oauth-protected-resource')
  @Version(VERSION_NEUTRAL)
  getProtectedResourceMetadata (@Req() request: FastifyRequest): ProtectedResourceMetadata {
    return this.buildMetadata(request)
  }

  @Public()
  @Get('.well-known/oauth-protected-resource/api/v1/mcp')
  @Version(VERSION_NEUTRAL)
  getProtectedResourceMetadataForMcp (@Req() request: FastifyRequest): ProtectedResourceMetadata {
    return this.buildMetadata(request)
  }

  private buildMetadata (request: FastifyRequest): ProtectedResourceMetadata {
    return {
      resource: buildMcpResourceUrl(request),
      authorization_servers: [this.config.issuer],
      scopes_supported: this.config.scopesSupported,
      bearer_methods_supported: ['header']
    }
  }
}
