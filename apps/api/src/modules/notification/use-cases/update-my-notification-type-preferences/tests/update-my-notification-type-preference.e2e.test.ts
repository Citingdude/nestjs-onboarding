import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationPreferencesBuilder } from '#src/modules/notification/entities/notification-preferences.entity.builder.js'
import { UpdateMyNotificationTypePreferenceCommandBuilder } from '#src/modules/notification/use-cases/update-my-notification-type-preferences/update-my-notification-type-preference.command.builder.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Update my notification type preferences e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([
      Permission.NOTIFICATION_PREFERENCES_UPDATE_TYPES
    ])
    userWithoutPermission = await setup.authContext.getUser([
      Permission.NOTIFICATION_PREFERENCES_READ_OWN
    ])

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
      .withTypes([])
      .withIsEnabled(false)
      .build()

    await setup.entityManager.insert(NotificationPreferences,
      [emailNotificationPreferences, appNotificationPreferences, smsNotificationPreferences]
    )
  })

  after(async () => {
    await setup.teardown()
  })

  it('should add notification preferences type', async () => {
    const command = new UpdateMyNotificationTypePreferenceCommandBuilder()
      .withChannel(NotificationChannel.SMS)
      .withIsEnabled(true)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const response = await request(setup.httpServer)
      .patch(`/api/v1/me/notification-preferences/types`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(204)

    const updatedSmsNotificationPreferences = await setup.entityManager.findOneOrFail(
      NotificationPreferences,
      {
        where: {
          userUuid: userWithPermission.user.uuid,
          channel: NotificationChannel.SMS
        }
      }
    )

    expect(updatedSmsNotificationPreferences.types).toStrictEqual(
      expect.arrayContaining([
        NotificationType.USER_CREATED
      ]))
  })

  it('should remove notification preferences type', async () => {
    const command = new UpdateMyNotificationTypePreferenceCommandBuilder()
      .withChannel(NotificationChannel.EMAIL)
      .withIsEnabled(false)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const response = await request(setup.httpServer)
      .patch(`/api/v1/me/notification-preferences/types`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(204)

    const updatedPreferences = await setup.entityManager.findOneOrFail(NotificationPreferences, {
      where: {
        userUuid: userWithPermission.user.uuid,
        channel: NotificationChannel.EMAIL
      }
    })

    expect(updatedPreferences.types).toStrictEqual(
      expect.arrayContaining([]))
  })

  it('returns 403 when user does not have permission', async () => {
    const command = new UpdateMyNotificationTypePreferenceCommandBuilder()
      .withChannel(NotificationChannel.SMS)
      .withIsEnabled(true)
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const response = await request(setup.httpServer)
      .patch(`/api/v1/me/notification-preferences/types`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
