import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import type { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'
import { NotificationPreferencePresetUpdatedEvent } from '#src/modules/notification/use-cases/update-my-notifcation-preference-preset/notification-preference-preset-updated.event.js'
import { UpdateNotificationPresetPreferenceUseCase } from '#src/modules/notification/use-cases/update-my-notifcation-preference-preset/update-my-notification-preference-preset.use-case.js'
import { UpdateMyNotificationPreferencePresetCommandBuilder } from '#src/modules/notification/use-cases/update-my-notifcation-preference-preset/update-my-notification-preference-preset.command.builder.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

describe('UpdateNotificationPresetPreferenceUseCase - Unit Tests', () => {
  before(() => TestBench.setupUnitTest())

  it('should emit NotificationPresetPreferenceUpdatedEvent', async () => {
    const repository = createStubInstance(TypeOrmRepository<NotificationPreferencesPreset>)
    repository.upsert.resolves()

    const userUuid = generateUuid<UserUuid>()
    const authContext = createStubInstance(AuthContext)
    authContext.getUserUuidOrFail.returns(userUuid)

    const eventEmitter = createStubInstance(DomainEventEmitter)
    const useCase = new UpdateNotificationPresetPreferenceUseCase(
      stubDataSource(),
      repository,
      authContext,
      eventEmitter
    )

    const command = new UpdateMyNotificationPreferencePresetCommandBuilder().build()

    await useCase.execute(command)

    expect(eventEmitter).toHaveEmitted(
      new NotificationPreferencePresetUpdatedEvent(userUuid, command.preset)
    )
  })
})
