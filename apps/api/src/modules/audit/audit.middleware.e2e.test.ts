import { after, before, beforeEach, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { createStubInstance, type SinonStubbedInstance } from 'sinon'
import { NestjsOtelLogger } from '@wisemen/opentelemetry'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

describe('AuditMiddleware e2e test', () => {
  let setup: TestSetup
  let authorizedUser: TestUser
  let logger: SinonStubbedInstance<NestjsOtelLogger>

  before(async () => {
    logger = createStubInstance(NestjsOtelLogger)

    setup = await TestBench.setupEndToEndTest({
      providerOverrides: [{ provider: NestjsOtelLogger, useValue: logger }]
    })

    authorizedUser = await setup.authContext.getUser([Permission.USER_READ])
  })

  after(async () => await setup.teardown())

  beforeEach(() => logger.log.resetHistory())

  it('logs an audit entry for the actual request that was made', async () => {
    const response = await request(setup.httpServer)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${authorizedUser.token}`)

    expect(response).toHaveStatus(200)
    expect(logger.log.calledOnce).toBe(true)
    expect(logger.log.firstCall.args[0]).toBe('API access: 200 GET /api/v1/users/me')
    expect(logger.log.firstCall.args[1]).toBe('AUDIT')
    expect(logger.log.firstCall.args[2]).toMatchObject({
      'audit.event_name': 'api.access',
      'actor.id': authorizedUser.user.userId,
      'actor.type': 'user',
      'method': 'GET',
      'path': '/api/v1/users/me',
      'query': {},
      'status_code': 200
    })
  })

  it('logs the query parameters that were sent on the actual request', async () => {
    const response = await request(setup.httpServer)
      .get('/api/v1/users/me')
      .query({ filter: { foo: 'bar' } })
      .set('Authorization', `Bearer ${authorizedUser.token}`)

    expect(response).toHaveStatus(200)
    expect(logger.log.firstCall.args[2]).toMatchObject({
      path: '/api/v1/users/me',
      query: { filter: { foo: 'bar' } }
    })
  })

  it('logs the client address and user agent of the actual request', async () => {
    const response = await request(setup.httpServer)
      .get('/api/v1/users/me')
      .set('User-Agent', 'audit-e2e/1.0')
      .set('Authorization', `Bearer ${authorizedUser.token}`)

    expect(response).toHaveStatus(200)
    expect(logger.log.firstCall.args[2]).toMatchObject({
      'user_agent.original': 'audit-e2e/1.0'
    })
    expect(logger.log.firstCall.args[2]).toHaveProperty(['client.address'], expect.any(String))
  })

  it('logs an anonymous actor when the request is unauthenticated', async () => {
    const response = await request(setup.httpServer).get('/api/v1/users/me')

    expect(response).toHaveStatus(401)
    expect(logger.log.firstCall.args[2]).toMatchObject({
      'audit.event_name': 'api.access',
      'actor.type': 'anonymous',
      'status_code': 401
    })
    expect(logger.log.firstCall.args[2]).not.toHaveProperty(['actor.id'])
  })
})
