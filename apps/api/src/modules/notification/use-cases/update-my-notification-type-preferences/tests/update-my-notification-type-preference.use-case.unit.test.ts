import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { generateUuid } from '@wisemen/nestjs-common'
import { UpdateMyNotificationPreferenceTypeUseCase } from '#src/modules/notification/use-cases/update-my-notification-type-preferences/update-my-notification-type-preference.use-case.js'
import type { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationPreferencesBuilder } from '#src/modules/notification/entities/notification-preferences.entity.builder.js'
import { UpdateMyNotificationTypePreferenceCommandBuilder } from '#src/modules/notification/use-cases/update-my-notification-type-preferences/update-my-notification-type-preference.command.builder.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

describe('UpdateMyNotificationTypePreference - Unit Tests', () => {
  before(() => TestBench.setupUnitTest())

  it('Enables a new notification type', async () => {
    const authContext = createStubInstance(AuthContext)
    authContext.getUserUuidOrFail.returns(generateUuid())

    const repo = createStubInstance(TypeOrmRepository<NotificationPreferences>)
    repo.findOneByOrFail.resolves(new NotificationPreferencesBuilder()
      .withTypes([])
      .build())

    const useCase = new UpdateMyNotificationPreferenceTypeUseCase(
      repo,
      authContext
    )

    const command = new UpdateMyNotificationTypePreferenceCommandBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .withIsEnabled(true)
      .build()

    await useCase.execute(command)

    expect(repo.update.getCall(0).lastArg).toStrictEqual(expect.objectContaining({
      types: [NotificationType.USER_CREATED]
    }))
  })

  it('Removes a disabled notification type', async () => {
    const authContext = createStubInstance(AuthContext)
    authContext.getUserUuidOrFail.returns(generateUuid())

    const repo = createStubInstance(TypeOrmRepository<NotificationPreferences>)
    repo.findOneByOrFail.resolves(new NotificationPreferencesBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .build())

    const useCase = new UpdateMyNotificationPreferenceTypeUseCase(
      repo,
      authContext
    )

    const command = new UpdateMyNotificationTypePreferenceCommandBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .withIsEnabled(false)
      .build()

    await useCase.execute(command)

    expect(repo.update.getCall(0).lastArg).toStrictEqual(expect.objectContaining({
      types: []
    }))
  })

  it('Does nothing when disabling a disabled type', async () => {
    const authContext = createStubInstance(AuthContext)
    authContext.getUserUuidOrFail.returns(generateUuid())

    const repo = createStubInstance(TypeOrmRepository<NotificationPreferences>)
    repo.findOneByOrFail.resolves(new NotificationPreferencesBuilder()
      .withTypes([])
      .build())

    const useCase = new UpdateMyNotificationPreferenceTypeUseCase(
      repo,
      authContext
    )

    const command = new UpdateMyNotificationTypePreferenceCommandBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .withIsEnabled(false)
      .build()

    await useCase.execute(command)

    expect(repo.update.getCall(0).lastArg).toStrictEqual(expect.objectContaining({
      types: []
    }))
  })

  it('Does nothing when enabling an enabled type', async () => {
    const authContext = createStubInstance(AuthContext)
    authContext.getUserUuidOrFail.returns(generateUuid())

    const repo = createStubInstance(TypeOrmRepository<NotificationPreferences>)
    repo.findOneByOrFail.resolves(new NotificationPreferencesBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .build())

    const useCase = new UpdateMyNotificationPreferenceTypeUseCase(
      repo,
      authContext
    )

    const command = new UpdateMyNotificationTypePreferenceCommandBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .withIsEnabled(true)
      .build()

    await useCase.execute(command)

    expect(repo.update.getCall(0).lastArg).toStrictEqual(expect.objectContaining({
      types: [NotificationType.USER_CREATED]
    }))
  })
})
