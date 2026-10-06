import { before, describe, it } from 'node:test'
import { EventEmitter } from 'node:events'
import type { ServerResponse } from 'node:http'
import { createStubInstance, stub } from 'sinon'
import { expect } from 'expect'
import { NestjsOtelLogger } from '@wisemen/opentelemetry'
import type { FastifyRequest } from 'fastify'
import { AuditMiddleware } from './audit.middleware.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import type { AuthenticatedApiKey, AuthenticatedUser } from '#src/modules/auth/authentication/auth-principal.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('AuditMiddleware unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('logs the actor, request details, and status code when the response finishes', () => {
    const authContext = createStubInstance(AuthContext)
    const logger = createStubInstance(NestjsOtelLogger)
    const next = stub()
    const response = createResponse(200)
    const auth: AuthenticatedUser = {
      type: 'user',
      userId: 'user-id',
      userUuid: 'e4c5406a-cd00-4f2e-a4d5-6b7735a958ce' as AuthenticatedUser['userUuid']
    }
    authContext.getAuth.returns(auth)

    const middleware = new AuditMiddleware(authContext, logger)

    middleware.use(createRequest({
      method: 'GET',
      url: '/api/v1/contacts?filter[name]=Ada&tag=active&tag=beta',
      query: {
        filter: { name: 'Ada' },
        tag: ['active', 'beta']
      }
    }), response, next)

    expect(logger.log.called).toBe(false)
    response.emit('finish')
    expect(logger.log.calledOnceWithExactly('API access: 200 GET /api/v1/contacts', 'AUDIT', {
      'audit.event_name': 'api.access',
      'actor.id': auth.userId,
      'actor.type': 'user',
      'method': 'GET',
      'path': '/api/v1/contacts',
      'query': { filter: { name: 'Ada' }, tag: ['active', 'beta'] },
      'client.address': '192.0.2.10',
      'user_agent.original': 'test-agent/1.0',
      'status_code': 200
    })).toBe(true)
    expect(next.calledOnce).toBe(true)
  })

  it('logs an anonymous actor for unauthenticated requests', () => {
    const authContext = createStubInstance(AuthContext)
    const logger = createStubInstance(NestjsOtelLogger)
    const next = stub()
    const response = createResponse(401)
    authContext.getAuth.returns(null)

    const middleware = new AuditMiddleware(authContext, logger)

    middleware.use(createRequest({
      method: 'GET',
      url: '/api/v1/public/status',
      query: {}
    }), response, next)

    response.emit('finish')
    expect(logger.log.calledOnceWithExactly('API access: 401 GET /api/v1/public/status', 'AUDIT', {
      'audit.event_name': 'api.access',
      'actor.type': 'anonymous',
      'method': 'GET',
      'path': '/api/v1/public/status',
      'query': {},
      'client.address': '192.0.2.10',
      'user_agent.original': 'test-agent/1.0',
      'status_code': 401
    })).toBe(true)
    expect(next.calledOnce).toBe(true)
  })

  it('identifies the individual api key, and omits its permissions', () => {
    const authContext = createStubInstance(AuthContext)
    const logger = createStubInstance(NestjsOtelLogger)
    const next = stub()
    const response = createResponse(204)
    const auth: AuthenticatedApiKey = {
      type: 'api-key',
      apiKeyUuid: 'e4c5406a-cd00-4f2e-a4d5-6b7735a958ce' as AuthenticatedApiKey['apiKeyUuid'],
      permissions: [Permission.CONTACT_READ],
      userUuid: 'a841c38c-4614-4434-b1b4-16e32389431e' as AuthenticatedApiKey['userUuid'],
      userId: 'user-id'
    }
    authContext.getAuth.returns(auth)

    const middleware = new AuditMiddleware(authContext, logger)

    middleware.use(createRequest({
      method: 'DELETE',
      url: '/api/v1/contacts/e4c5406a-cd00-4f2e-a4d5-6b7735a958ce',
      query: {}
    }), response, next)

    response.emit('finish')
    expect(logger.log.calledOnceWithExactly('API access: 204 DELETE /api/v1/contacts/e4c5406a-cd00-4f2e-a4d5-6b7735a958ce', 'AUDIT', {
      'audit.event_name': 'api.access',
      'actor.id': auth.userId,
      'actor.type': 'api-key',
      'actor.api_key_uuid': auth.apiKeyUuid,
      'method': 'DELETE',
      'path': '/api/v1/contacts/e4c5406a-cd00-4f2e-a4d5-6b7735a958ce',
      'query': {},
      'client.address': '192.0.2.10',
      'user_agent.original': 'test-agent/1.0',
      'status_code': 204
    })).toBe(true)
    expect(next.calledOnce).toBe(true)
  })

  it('reads the actor before the request context unwinds', () => {
    const authContext = createStubInstance(AuthContext)
    const logger = createStubInstance(NestjsOtelLogger)
    const next = stub()
    const response = createResponse(200)
    const auth: AuthenticatedUser = {
      type: 'user',
      userId: 'user-id',
      userUuid: 'e4c5406a-cd00-4f2e-a4d5-6b7735a958ce' as AuthenticatedUser['userUuid']
    }
    authContext.getAuth.returns(auth)

    const middleware = new AuditMiddleware(authContext, logger)

    middleware.use(createRequest({ method: 'GET', url: '/api/v1/contacts', query: {} }), response, next)

    // The auth context has unwound by the time the response finishes, so a
    // late read would report the request as anonymous.
    authContext.getAuth.returns(null)
    response.emit('finish')

    expect(logger.log.firstCall.args[2]).toMatchObject({
      'actor.id': auth.userId,
      'actor.type': 'user'
    })
  })

  it('omits the user agent when the request did not send one', () => {
    const authContext = createStubInstance(AuthContext)
    const logger = createStubInstance(NestjsOtelLogger)
    const next = stub()
    const response = createResponse(200)
    authContext.getAuth.returns(null)

    const middleware = new AuditMiddleware(authContext, logger)

    middleware.use({
      method: 'GET',
      url: '/api/v1/contacts',
      query: {},
      ip: '192.0.2.10',
      headers: {}
    } as unknown as FastifyRequest, response, next)

    response.emit('finish')
    expect(logger.log.firstCall.args[2]).toMatchObject({
      'client.address': '192.0.2.10',
      'user_agent.original': undefined
    })
  })

  it('logs an empty query object when the request has no query parameters', () => {
    const authContext = createStubInstance(AuthContext)
    const logger = createStubInstance(NestjsOtelLogger)
    const next = stub()
    const response = createResponse(200)
    authContext.getAuth.returns(null)

    const middleware = new AuditMiddleware(authContext, logger)

    middleware.use(createRequest({
      method: 'GET',
      url: '/api/v1/contacts',
      query: {}
    }), response, next)

    response.emit('finish')
    expect(logger.log.firstCall.args[2]).toMatchObject({
      path: '/api/v1/contacts',
      query: {}
    })
  })

  it('logs query parameters with a single value as plain strings', () => {
    const authContext = createStubInstance(AuthContext)
    const logger = createStubInstance(NestjsOtelLogger)
    const next = stub()
    const response = createResponse(200)
    authContext.getAuth.returns(null)

    const middleware = new AuditMiddleware(authContext, logger)

    middleware.use(createRequest({
      method: 'GET',
      url: '/api/v1/contacts?page=2&size=25',
      query: { page: '2', size: '25' }
    }), response, next)

    response.emit('finish')
    expect(logger.log.firstCall.args[2]).toMatchObject({
      query: { page: '2', size: '25' }
    })
  })
})

function createRequest (request: {
  method: string
  url: string
  query: unknown
}): FastifyRequest {
  return {
    ...request,
    ip: '192.0.2.10',
    headers: { 'user-agent': 'test-agent/1.0' }
  } as unknown as FastifyRequest
}

function createResponse (statusCode: number): ServerResponse {
  return Object.assign(new EventEmitter(), { statusCode }) as ServerResponse
}
