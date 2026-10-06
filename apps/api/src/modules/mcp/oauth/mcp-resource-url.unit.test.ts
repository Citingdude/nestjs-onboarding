import { describe, it } from 'node:test'
import { expect } from 'expect'
import type { FastifyRequest } from 'fastify'
import { buildMcpResourceUrl, buildOrigin, buildProtectedResourceMetadataUrl } from './mcp-resource-url.js'

function requestFor (protocol: string, host: string): FastifyRequest {
  return { protocol, host } as unknown as FastifyRequest
}

describe('mcp resource url', () => {
  it('keeps a non-default port', () => {
    expect(buildOrigin(requestFor('http', 'localhost:3000'))).toBe('http://localhost:3000')
  })

  /**
   * An ingress may forward `Host: api.example.com:443`. RFC 9728 resource identifiers are
   * compared as strings, so advertising the default port would not match the URL the client asked
   * for.
   */
  it('drops a port that is the default for the scheme', () => {
    expect(buildOrigin(requestFor('https', 'api.example.com:443')))
      .toBe('https://api.example.com')
    expect(buildOrigin(requestFor('http', 'api.example.com:80')))
      .toBe('http://api.example.com')
  })

  it('leaves a host without a port alone', () => {
    expect(buildOrigin(requestFor('https', 'api.example.com')))
      .toBe('https://api.example.com')
  })

  it('builds the mcp resource and metadata urls off that origin', () => {
    const request = requestFor('https', 'api.example.com:443')

    expect(buildMcpResourceUrl(request)).toBe('https://api.example.com/api/v1/mcp')
    expect(buildProtectedResourceMetadataUrl(request))
      .toBe('https://api.example.com/.well-known/oauth-protected-resource')
  })
})
