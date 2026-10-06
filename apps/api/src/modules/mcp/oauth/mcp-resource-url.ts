import type { FastifyRequest } from 'fastify'

export const MCP_ENDPOINT_PATH = '/api/v1/mcp'
export const PROTECTED_RESOURCE_METADATA_PATH = '/.well-known/oauth-protected-resource'

export function buildOrigin (request: FastifyRequest): string {
  return new URL(`${request.protocol}://${request.host}`).origin
}

export function buildMcpResourceUrl (request: FastifyRequest): string {
  return `${buildOrigin(request)}${MCP_ENDPOINT_PATH}`
}

export function buildProtectedResourceMetadataUrl (request: FastifyRequest): string {
  return `${buildOrigin(request)}${PROTECTED_RESOURCE_METADATA_PATH}`
}
