import { after, before, describe, it } from 'node:test'
import { expect } from 'expect'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { NotificationBuilder } from '#src/modules/notification/entities/notification.entity.builder.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { NotificationPreset } from '#src/modules/notification/enums/notification-preset.enum.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { CreateUserNotificationsRepository } from '#src/modules/notification/use-cases/create-user-notifications/create-user-notifications.repository.js'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationPreferencesPresetBuilder } from '#src/modules/notification/entities/notification-preferences-preset.entity.builder.js'
import { NotificationPreferencesBuilder } from '#src/modules/notification/entities/notification-preferences.entity.builder.js'
import { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'
import { SystemQueueModule } from '#src/modules/queue-modules/system-queue.module.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

describe('SendAppNotificationRepository - Integration Tests', () => {
  let setup: TestSetup
  let repository: CreateUserNotificationsRepository
  let user1: User
  let user2: User
  let userNonePreset: User
  let userAllPreset: User
  let userDefaultPreset: User
  let notification: Notification

  before(async () => {
    setup = await TestBench.setupModuleTest(SystemQueueModule)
    repository = setup.app.get(CreateUserNotificationsRepository, { strict: false })
    user1 = new UserBuilder().withEmail('user1@email.com').build()
    user2 = new UserBuilder().withEmail('user2@email.com').build()
    userNonePreset = new UserBuilder().withEmail('userNone@email.com').build()
    userAllPreset = new UserBuilder().withEmail('userAll@email.com').build()
    userDefaultPreset = new UserBuilder().withEmail('userDefault@email.com').build()

    const notificationPresetPreferenceUser1 = new NotificationPreferencesPresetBuilder()
      .withUserUuid(user1.uuid)
      .withPreset(NotificationPreset.CUSTOM)
      .build()

    const notificationPresetPreferenceUser2 = new NotificationPreferencesPresetBuilder()
      .withUserUuid(user2.uuid)
      .withPreset(NotificationPreset.CUSTOM)
      .build()

    const notificationPresetPreferenceNone = new NotificationPreferencesPresetBuilder()
      .withUserUuid(userNonePreset.uuid)
      .withPreset(NotificationPreset.NONE)
      .build()

    const notificationPresetPreferenceAll = new NotificationPreferencesPresetBuilder()
      .withUserUuid(userAllPreset.uuid)
      .withPreset(NotificationPreset.ALL)
      .build()

    const notificationPresetPreferenceDefault = new NotificationPreferencesPresetBuilder()
      .withUserUuid(userDefaultPreset.uuid)
      .withPreset(NotificationPreset.DEFAULT)
      .build()

    notification = new NotificationBuilder()
      .withType(NotificationType.USER_CREATED)
      .withMeta({ userName: 'John Doe' })
      .withCreatedByUserUuid(user1.uuid)
      .build()

    const user1AppPreference = new NotificationPreferencesBuilder()
      .withUserUuid(user1.uuid)
      .withChannel(NotificationChannel.APP)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const user1PushPreference2 = new NotificationPreferencesBuilder()
      .withUserUuid(user1.uuid)
      .withChannel(NotificationChannel.PUSH)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const user2AppPreference = new NotificationPreferencesBuilder()
      .withUserUuid(user2.uuid)
      .withChannel(NotificationChannel.APP)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const user2PushPreference2 = new NotificationPreferencesBuilder()
      .withUserUuid(user2.uuid)
      .withChannel(NotificationChannel.PUSH)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const userNonePresetAppPreference = new NotificationPreferencesBuilder()
      .withUserUuid(userNonePreset.uuid)
      .withChannel(NotificationChannel.APP)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const userNonePresetPushPreference = new NotificationPreferencesBuilder()
      .withUserUuid(userNonePreset.uuid)
      .withChannel(NotificationChannel.PUSH)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const userAllPresetNotificationPreference = new NotificationPreferencesBuilder()
      .withUserUuid(userAllPreset.uuid)
      .withChannel(NotificationChannel.APP)
      .withTypes([])
      .build()

    const userDefaultPresetNotificationPreference = new NotificationPreferencesBuilder()
      .withUserUuid(userDefaultPreset.uuid)
      .withChannel(NotificationChannel.APP)
      .withTypes([])
      .build()

    await setup.dataSource.manager.insert(User, [
      user1, user2, userNonePreset,
      userAllPreset, userDefaultPreset
    ])
    await setup.dataSource.manager.insert(NotificationPreferencesPreset, [
      notificationPresetPreferenceUser1,
      notificationPresetPreferenceUser2,
      notificationPresetPreferenceNone,
      notificationPresetPreferenceAll,
      notificationPresetPreferenceDefault
    ])
    await setup.dataSource.manager
      .insert(Notification, notification)
    await setup.dataSource.manager.insert(NotificationPreferences, [
      user1AppPreference,
      user1PushPreference2,
      user2AppPreference,
      user2PushPreference2,
      userNonePresetAppPreference,
      userNonePresetPushPreference,
      userAllPresetNotificationPreference,
      userDefaultPresetNotificationPreference
    ])
  })

  after(async () => await setup.teardown())

  it(`Returns all users which have preset ALL, DEFAULT or CUSTOM with the notification type enabled. It excludes the creator of the notification`, async () => {
    const generator = repository.getSubscribedUsers({
      channel: NotificationChannel.APP,
      notification,
      includeUsersWithDefaultPreset: true,
      batchSize: 10
    })

    for await (const users of generator) {
      expect(users).toHaveLength(3)
      expect(users).toEqual(
        expect.arrayContaining([
          { uuid: user2.uuid },
          { uuid: userAllPreset.uuid },
          { uuid: userDefaultPreset.uuid }
        ])
      )
    }
  })

  it(`Excludes all users which have preset DEFAULT when the notification is not enabled by default`, async () => {
    const generator = repository.getSubscribedUsers({
      batchSize: 10,
      channel: NotificationChannel.APP,
      includeUsersWithDefaultPreset: false,
      notification
    })

    for await (const users of generator) {
      expect(users).toHaveLength(2)
      expect(users).toEqual(
        expect.arrayContaining([
          { uuid: user2.uuid },
          { uuid: userAllPreset.uuid }
        ])
      )
    }
  })
})
