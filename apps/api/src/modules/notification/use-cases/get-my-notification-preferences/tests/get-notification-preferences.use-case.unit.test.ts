import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { expect } from 'expect'
import { NotificationPreset } from '#src/modules/notification/enums/notification-preset.enum.js'
import type { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { GetMyNotificationPreferencesUseCase } from '#src/modules/notification/use-cases/get-my-notification-preferences/get-my-notification-preferences.use-case.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { getDefaultTypesOfChannel, getSupportedNotificationTypesOfChannel } from '#src/modules/notification/notification-types-config.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import type { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'

describe('CreateNotificationUseCase - Unit Tests', () => {
  before(() => TestBench.setupUnitTest())

  it('Should return all supported notifications types when preset is ALL', async () => {
    const dataSource = stubDataSource()
    const presetRepo = createStubInstance(TypeOrmRepository<NotificationPreferencesPreset>)
    const preferencesRepo = createStubInstance(TypeOrmRepository<NotificationPreferences>)
    const authContext = createStubInstance(AuthContext)

    presetRepo.findOneByOrFail.resolves({
      preset: NotificationPreset.ALL
    })

    const useCase = new GetMyNotificationPreferencesUseCase(
      dataSource,
      preferencesRepo,
      presetRepo,
      authContext
    )

    const response = await useCase.execute()
    expect(response).toEqual({
      preset: NotificationPreset.ALL,
      emailEnabled: true,
      smsEnabled: true,
      appEnabled: true,
      pushEnabled: true,
      preferences: {
        email: getSupportedNotificationTypesOfChannel(NotificationChannel.EMAIL),
        sms: getSupportedNotificationTypesOfChannel(NotificationChannel.SMS),
        app: getSupportedNotificationTypesOfChannel(NotificationChannel.APP),
        push: getSupportedNotificationTypesOfChannel(NotificationChannel.PUSH)
      }
    })
  })

  it('Should return no notifications types when preset is NONE', async () => {
    const dataSource = stubDataSource()
    const presetRepo = createStubInstance(TypeOrmRepository<NotificationPreferencesPreset>)
    const preferencesRepo = createStubInstance(TypeOrmRepository<NotificationPreferences>)
    const authContext = createStubInstance(AuthContext)

    presetRepo.findOneByOrFail.resolves({
      preset: NotificationPreset.NONE
    })

    const useCase = new GetMyNotificationPreferencesUseCase(
      dataSource,
      preferencesRepo,
      presetRepo,
      authContext
    )

    const response = await useCase.execute()
    expect(response).toEqual({
      preset: NotificationPreset.NONE,
      emailEnabled: false,
      smsEnabled: false,
      appEnabled: false,
      pushEnabled: false,
      preferences: {
        email: [],
        sms: [],
        app: [],
        push: []
      }
    })
  })

  it('Should return all default notifications types when preset is Default', async () => {
    const dataSource = stubDataSource()
    const presetRepo = createStubInstance(TypeOrmRepository<NotificationPreferencesPreset>)
    const preferencesRepo = createStubInstance(TypeOrmRepository<NotificationPreferences>)
    const authContext = createStubInstance(AuthContext)

    presetRepo.findOneByOrFail.resolves({
      preset: NotificationPreset.DEFAULT
    })

    const useCase = new GetMyNotificationPreferencesUseCase(
      dataSource,
      preferencesRepo,
      presetRepo,
      authContext
    )

    const response = await useCase.execute()
    expect(response).toEqual({
      preset: NotificationPreset.DEFAULT,
      emailEnabled: true,
      smsEnabled: true,
      appEnabled: true,
      pushEnabled: true,
      preferences: {
        email: getDefaultTypesOfChannel(NotificationChannel.EMAIL),
        sms: getDefaultTypesOfChannel(NotificationChannel.SMS),
        app: getDefaultTypesOfChannel(NotificationChannel.APP),
        push: getDefaultTypesOfChannel(NotificationChannel.PUSH)
      }
    })
  })
})
