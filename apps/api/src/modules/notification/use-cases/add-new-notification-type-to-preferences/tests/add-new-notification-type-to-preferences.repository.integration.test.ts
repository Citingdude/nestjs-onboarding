import { after, before, describe, it } from 'node:test'
import { expect } from 'expect'
import { AddNewNotificationTypeToPreferenceRepository } from '#src/modules/notification/use-cases/add-new-notification-type-to-preferences/add-new-notification-type-to-preferences.repository.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationPreferencesBuilder } from '#src/modules/notification/entities/notification-preferences.entity.builder.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { notificationCategory } from '#src/modules/notification/notification-category.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { SystemQueueModule } from '#src/modules/queue-modules/system-queue.module.js'

describe('AddNewNotificationTypeToPreferenceRepository - Integration Tests', () => {
  let setup: TestSetup
  let repository: AddNewNotificationTypeToPreferenceRepository
  let user1AppPreference: NotificationPreferences
  let user1PushPreference: NotificationPreferences
  let user2AppPreference: NotificationPreferences
  let user2PushPreference: NotificationPreferences
  let user3PushPreference: NotificationPreferences
  let user3notificationPreference2: NotificationPreferences

  before(async () => {
    setup = await TestBench.setupModuleTest(SystemQueueModule)
    repository = setup.app.get(AddNewNotificationTypeToPreferenceRepository, { strict: false })

    const user1 = new UserBuilder().withEmail('user1@email.com').build()
    const user2 = new UserBuilder().withEmail('user2@email.com').build()
    const user3 = new UserBuilder().withEmail('user3@email.com').build()

    user1AppPreference = new NotificationPreferencesBuilder()
      .withUserUuid(user1.uuid)
      .withChannel(NotificationChannel.APP)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    user1PushPreference = new NotificationPreferencesBuilder()
      .withUserUuid(user1.uuid)
      .withChannel(NotificationChannel.PUSH)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    user2AppPreference = new NotificationPreferencesBuilder()
      .withUserUuid(user2.uuid)
      .withChannel(NotificationChannel.APP)
      .withTypes([])
      .build()

    user2PushPreference = new NotificationPreferencesBuilder()
      .withUserUuid(user2.uuid)
      .withChannel(NotificationChannel.PUSH)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    user3PushPreference = new NotificationPreferencesBuilder()
      .withUserUuid(user3.uuid)
      .withChannel(NotificationChannel.PUSH)
      .withTypes([])
      .build()

    user3notificationPreference2 = new NotificationPreferencesBuilder()
      .withUserUuid(user3.uuid)
      .withChannel(NotificationChannel.EMAIL)
      .withTypes([])
      .build()

    await setup.dataSource.manager.insert(User, [user1, user2, user3])
    await setup.dataSource.manager.insert(NotificationPreferences, [
      user1AppPreference,
      user1PushPreference,
      user2AppPreference,
      user2PushPreference,
      user3PushPreference,
      user3notificationPreference2
    ])
  })

  after(async () => await setup.teardown())

  it(`Should return all notification preferences of the given channels`, async () => {
    const generator = repository.findAllPreferenceUuids(
      [NotificationChannel.APP, NotificationChannel.PUSH],
      10
    )

    for await (const uuids of generator) {
      expect(uuids).toHaveLength(5)
      expect(uuids).toEqual(
        expect.arrayContaining([
          user1AppPreference.uuid,
          user1PushPreference.uuid,
          user2AppPreference.uuid,
          user2PushPreference.uuid,
          user3PushPreference.uuid
        ])
      )
    }
  })

  it(`Should return all semi subscribed notification preferences of the given channels`, async () => {
    const generator = repository.findUserPreferencesAlreadySubscribedToCategory(
      notificationCategory(NotificationType.USER_CREATED),
      [NotificationChannel.APP, NotificationChannel.PUSH],
      10
    )

    for await (const uuids of generator) {
      expect(uuids).toHaveLength(3)
      expect(uuids).toEqual(
        expect.arrayContaining([
          user1AppPreference.uuid,
          user1PushPreference.uuid,
          user2PushPreference.uuid
        ])
      )
    }
  })
})
