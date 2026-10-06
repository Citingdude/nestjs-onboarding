import { before, describe, it } from 'node:test'
import type { ServerResponse } from 'node:http'
import { createStubInstance, stub } from 'sinon'
import { expect } from 'expect'
import type { FastifyRequest } from 'fastify'
import { generateUuid } from '@wisemen/nestjs-common'
import { DomainEventLogActorMiddleware } from './domain-event-log-actor.middleware.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import type { AuthenticatedApiKey, AuthenticatedUser } from '#src/modules/auth/authentication/auth-principal.type.js'
import { DomainEventLogActorContext, type DomainEventLogActor } from '#src/modules/domain-event-log/modules/domain-event-log-actor-context/domain-event-log-actor.context.js'
import { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

describe('DomainEventLogActorMiddleware unit tests', () => {
  before(() => TestBench.setupUnitTest())

  function resolveActor (
    auth: AuthenticatedUser | AuthenticatedApiKey | null
  ): DomainEventLogActor {
    const authContext = createStubInstance(AuthContext)
    const actorContext = new DomainEventLogActorContext()
    let actor: DomainEventLogActor | undefined

    authContext.getAuth.returns(auth)

    new DomainEventLogActorMiddleware(authContext, actorContext).use(
      {} as FastifyRequest,
      {} as ServerResponse,
      stub().callsFake(() => { actor = actorContext.getActor() })
    )

    expect(actor).toBeDefined()

    return actor!
  }

  it('resolves the user as actor', () => {
    const userUuid = generateUuid<UserUuid>()

    expect(resolveActor({ type: 'user', userUuid, userId: 'user-id' })).toEqual({
      actorType: DomainEventActorType.USER,
      actorId: userUuid
    })
  })

  it('resolves the api key as actor', () => {
    const apiKeyUuid = generateUuid<ApiKeyUuid>()

    expect(resolveActor({
      type: 'api-key',
      apiKeyUuid,
      permissions: [Permission.CONTACT_READ],
      userUuid: generateUuid<UserUuid>(),
      userId: 'user-id'
    })).toEqual({
      actorType: DomainEventActorType.API_KEY,
      actorId: apiKeyUuid
    })
  })

  it('resolves no actor when the request is unauthenticated', () => {
    expect(resolveActor(null)).toEqual({ actorType: null, actorId: null })
  })
})
