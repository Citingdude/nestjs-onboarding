import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationPreferencesBuilder } from '#src/modules/notification/entities/notification-preferences.entity.builder.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { UpdateMyChannelNotificationPreferenceCommandBuilder } from '#src/modules/notification/use-cases/update-my-channel-notification-preference/update-my-channel-notification-preference.command.builder.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Update my channel notification preferences e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([
      Permission.NOTIFICATION_PREFERENCES_UPDATE_CHANNEL
    ])
    userWithoutPermission = await setup.authContext.getUser([
      Permission.NOTIFICATION_PREFERENCES_READ_OWN
    ])
  })

  after(async () => {
    await setup.teardown()
  })

  it('should update global notification preferences', async () => {
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

    await setup.entityManager.insert(NotificationPreferences,
      [emailNotificationPreferences, appNotificationPreferences, smsNotificationPreferences]
    )

    const command = new UpdateMyChannelNotificationPreferenceCommandBuilder()
      .withChannel(NotificationChannel.SMS)
      .withIsEnabled(true)
      .build()

    const response = await request(setup.httpServer)
      .patch(`/api/v1/me/notification-preferences/channels`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(204)

    const updatedSmsNotificationPreferences = await setup.entityManager.findOne(
      NotificationPreferences,
      {
        where: {
          userUuid: userWithPermission.user.uuid,
          channel: NotificationChannel.SMS
        }
      }
    )

    expect(updatedSmsNotificationPreferences?.isEnabled).toEqual(true)
  })

  it('returns 403 when user does not have permission', async () => {
    const command = new UpdateMyChannelNotificationPreferenceCommandBuilder()
      .withChannel(NotificationChannel.SMS)
      .withIsEnabled(true)
      .build()

    const response = await request(setup.httpServer)
      .patch(`/api/v1/me/notification-preferences/channels`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
