import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { AssignDefaultNotificationPreferencesToUserUseCase } from '#src/modules/notification/use-cases/assign-default-notification-preferences-to-user/assign-default-notification-preferences-to-user.use-case.js'
import { AssignDefaultNotificationPreferencesToUserRepository } from '#src/modules/notification/use-cases/assign-default-notification-preferences-to-user/assign-default-notification-preferences-to-user.repository.js'
import { DefaultNotificationPreferencesAssignedToUserEvent } from '#src/modules/notification/use-cases/assign-default-notification-preferences-to-user/default-notification-preferences-assigned-to-user.event.js'

import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

describe('Assign default preferences to user use case unit test', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when the user does not exist', async () => {
    const repository = createStubInstance(AssignDefaultNotificationPreferencesToUserRepository)
    repository.userExists.resolves(false)

    const useCase = new AssignDefaultNotificationPreferencesToUserUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    const userUuid = generateUuid<UserUuid>()

    await expect(useCase.assignDefaultPreferences(userUuid))
      .rejects.toThrow(new UserNotFoundError(userUuid))
  })

  it('emits an event when the default preferences are assigned', async () => {
    const repository = createStubInstance(AssignDefaultNotificationPreferencesToUserRepository)
    repository.userExists.resolves(true)
    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new AssignDefaultNotificationPreferencesToUserUseCase(
      stubDataSource(),
      eventEmitter,
      repository
    )

    const userUuid = generateUuid<UserUuid>()
    await useCase.assignDefaultPreferences(userUuid)

    const expectedEvent = new DefaultNotificationPreferencesAssignedToUserEvent(userUuid)
    expect(eventEmitter).toHaveEmitted(expectedEvent)
  })
})
