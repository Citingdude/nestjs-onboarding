import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationPreferencesBuilder } from '#src/modules/notification/entities/notification-preferences.entity.builder.js'
import { NotificationPreferencesPresetBuilder } from '#src/modules/notification/entities/notification-preferences-preset.entity.builder.js'
import { NotificationPreset } from '#src/modules/notification/enums/notification-preset.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Get my notification preferences e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([
      Permission.NOTIFICATION_PREFERENCES_READ_OWN
    ])
    userWithoutPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_OWN])
  })

  after(async () => {
    await setup.teardown()
  })

  it('returns notification preferences: Custom Preset', async () => {
    const notificationPreset = new NotificationPreferencesPresetBuilder()
      .withPreset(NotificationPreset.CUSTOM)
      .withUserUuid(userWithPermission.user.uuid)
      .build()

    const emailNotificationPreferences = new NotificationPreferencesBuilder()
      .withUserUuid(userWithPermission.user.uuid)
      .withChannel(NotificationChannel.EMAIL)
      .withTypes([NotificationType.USER_CREATED])
      .withIsEnabled(true)
      .build()

    const appNotificationPreferences = new NotificationPreferencesBuilder()
      .withUserUuid(userWithPermission.user.uuid)
      .withChannel(NotificationChannel.APP)
      .withTypes([NotificationType.USER_CREATED])
      .withIsEnabled(false)
      .build()

    const smsNotificationPreferences = new NotificationPreferencesBuilder()
      .withUserUuid(userWithPermission.user.uuid)
      .withChannel(NotificationChannel.SMS)
      .withTypes([NotificationType.USER_CREATED])
      .withIsEnabled(false)
      .build()

    await setup.entityManager.insert(NotificationPreferencesPreset, [notificationPreset])
    await setup.entityManager.insert(NotificationPreferences,
      [emailNotificationPreferences, appNotificationPreferences, smsNotificationPreferences]
    )

    const response = await request(setup.httpServer)
      .get(`/api/v1/me/notification-preferences`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body).toEqual({
      preset: NotificationPreset.CUSTOM,
      emailEnabled: true,
      smsEnabled: false,
      appEnabled: false,
      pushEnabled: false,
      preferences: {
        email: [NotificationType.USER_CREATED],
        sms: [NotificationType.USER_CREATED],
        app: [NotificationType.USER_CREATED],
        push: []
      }
    })
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/me/notification-preferences`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
