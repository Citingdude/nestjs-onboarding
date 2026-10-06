import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { NotificationPreset } from '#src/modules/notification/enums/notification-preset.enum.js'
import { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'
import { UpdateMyNotificationPreferencePresetCommandBuilder } from '#src/modules/notification/use-cases/update-my-notifcation-preference-preset/update-my-notification-preference-preset.command.builder.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Update notification preset preference e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([
      Permission.NOTIFICATION_PREFERENCES_UPDATE_PRESET
    ])
    userWithoutPermission = await setup.authContext.getUser([
      Permission.NOTIFICATION_PREFERENCES_READ_OWN
    ])
  })

  after(async () => {
    await setup.teardown()
  })

  it('should update notification preset preference', async () => {
    const command = new UpdateMyNotificationPreferencePresetCommandBuilder()
      .withPreset(NotificationPreset.ALL)
      .build()

    const response = await request(setup.httpServer)
      .patch(`/api/v1/me/notification-preferences/preset`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(204)

    const notificationPresetPreferences = await setup.entityManager.findOneOrFail(
      NotificationPreferencesPreset,
      {
        where: {
          userUuid: userWithPermission.user.uuid
        }
      }
    )

    expect(notificationPresetPreferences.preset).toBe(command.preset)
  })

  it('returns 403 when user does not have permission', async () => {
    const command = new UpdateMyNotificationPreferencePresetCommandBuilder()
      .withPreset(NotificationPreset.ALL)
      .build()

    const response = await request(setup.httpServer)
      .patch(`/api/v1/me/notification-preferences/preset`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
