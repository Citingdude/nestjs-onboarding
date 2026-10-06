import { before, describe, it } from 'node:test'
import { expect } from 'expect'
import { createStubInstance, stub } from 'sinon'
import type { User as ZitadelUser } from '@zitadel/proto/zitadel/user/v2/user_pb.js'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import type { ZitadelClient, ZitadelUserClient } from '@wisemen/nestjs-zitadel'
import { UserUpdatedEvent } from '#src/modules/auth/users/use-cases/sync-user-from-zitadel/user-updated.event.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { SyncUserFromZitadelRepository } from '#src/modules/auth/users/use-cases/sync-user-from-zitadel/sync-user-from-zitadel.repository.js'
import { SyncUserFromZitadelUseCase } from '#src/modules/auth/users/use-cases/sync-user-from-zitadel/sync-user-from-zitadel.use-case.js'

const buildZitadelHumanUser = (
  givenName: string,
  familyName: string
): ZitadelUser => ({
  $typeName: 'zitadel.user.v2.User',
  userId: 'user-1',
  details: undefined,
  state: 0,
  username: 'user-1',
  loginNames: [],
  preferredLoginName: '',
  type: {
    case: 'human',
    value: {
      $typeName: 'zitadel.user.v2.HumanUser',
      userId: 'user-1',
      state: 0,
      username: 'user-1',
      loginNames: [],
      preferredLoginName: '',
      profile: {
        $typeName: 'zitadel.user.v2.HumanProfile',
        familyName,
        givenName,
        nickName: '',
        preferredLanguage: '',
        displayName: '',
        avatarUrl: ''
      },
      passwordChangeRequired: false
    }
  }
})

describe('Sync user from Zitadel use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('updates user names from Zitadel and emits an event when data changed', async () => {
    const user = new UserBuilder()
      .withFirstName('Old')
      .withLastName('Name')
      .build()

    const repository = createStubInstance(SyncUserFromZitadelRepository)
    repository.findUser.resolves(user)

    const zitadelUser: ZitadelUser = buildZitadelHumanUser('Alice', 'Smith')

    const getUserByID = stub().resolves({ user: zitadelUser })
    const zitadelUserClient = { getUserByID } as unknown as ZitadelUserClient

    const zitadelClient = { userClient: zitadelUserClient } as unknown as ZitadelClient

    const eventEmitter = createStubInstance(DomainEventEmitter)
    const useCase = new SyncUserFromZitadelUseCase(
      stubDataSource(),
      zitadelClient,
      repository,
      eventEmitter
    )

    await useCase.execute(user.uuid)

    expect(repository.updateUserNames.calledWith(user.uuid, 'Alice', 'Smith')).toBe(true)
    expect(eventEmitter).toHaveEmitted(new UserUpdatedEvent(user.uuid, 'Alice', 'Smith'))
    expect(getUserByID.calledWith({ userId: user.userId })).toBe(true)
  })

  it('does nothing when the names did not change', async () => {
    const user = new UserBuilder()
      .withFirstName('Alice')
      .withLastName('Smith')
      .build()

    const repository = createStubInstance(SyncUserFromZitadelRepository)
    repository.findUser.resolves(user)

    const zitadelUser: ZitadelUser = buildZitadelHumanUser('Alice', 'Smith')

    const getUserByID = stub().resolves({ user: zitadelUser })
    const zitadelUserClient = { getUserByID } as unknown as ZitadelUserClient

    const zitadelClient = { userClient: zitadelUserClient } as unknown as ZitadelClient

    const eventEmitter = createStubInstance(DomainEventEmitter)
    const useCase = new SyncUserFromZitadelUseCase(
      stubDataSource(),
      zitadelClient,
      repository,
      eventEmitter
    )

    await useCase.execute(user.uuid)

    expect(repository.updateUserNames.called).toBe(false)
    expect(eventEmitter.emit.called).toBe(false)
    expect(eventEmitter.emitOne.called).toBe(false)
  })
})
