import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { AddNewNotificationTypeToPreferenceRepository } from '#src/modules/notification/use-cases/add-new-notification-type-to-preferences/add-new-notification-type-to-preferences.repository.js'
import { AddNewNotificationTypeToPreferencesUseCase } from '#src/modules/notification/use-cases/add-new-notification-type-to-preferences/add-new-notification-type-to-preferences.use-case.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationPreferencesBuilder } from '#src/modules/notification/entities/notification-preferences.entity.builder.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('AddNewNotificationTypeToPreferencesUseCase - Unit Tests', () => {
  before(() => TestBench.setupUnitTest())

  it('Update notification preferences is called', async () => {
    const repo = createStubInstance(AddNewNotificationTypeToPreferenceRepository)
    const notificationPref1 = new NotificationPreferencesBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .build()
    const notificationPref2 = new NotificationPreferencesBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .build()

    repo.findAllPreferenceUuids.callsFake(async function* () {
      yield await new Promise(res => res([notificationPref1.uuid, notificationPref2.uuid]))
    })

    const useCase = new AddNewNotificationTypeToPreferencesUseCase(repo)

    await useCase.execute(NotificationType.USER_CREATED, true)

    expect(repo.enableNotificationTypeFor.firstCall.firstArg.length).toBe(2)
    expect(repo.enableNotificationTypeFor.firstCall.firstArg).toEqual([
      notificationPref1.uuid,
      notificationPref2.uuid
    ])
    expect(repo.enableNotificationTypeFor.firstCall.lastArg).toEqual(NotificationType.USER_CREATED)
  })
})
