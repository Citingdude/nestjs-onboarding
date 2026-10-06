import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { NotificationBuilder } from '#src/modules/notification/entities/notification.entity.builder.js'
import { UserNotificationBuilder } from '#src/modules/notification/entities/user-notification.entity.builder.js'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('View user notification detail e2e tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_OWN])
    userWithoutPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_CONFIG])
  })

  after(async () => await setup.teardown())

  it('returns the notification details', async () => {
    const notification = new NotificationBuilder().build()
    const userNotification = new UserNotificationBuilder()
      .withChannel(NotificationChannel.APP)
      .withNotificationUuid(notification.uuid)
      .withUserUuid(userWithPermission.user.uuid)
      .build()

    await setup.entityManager.insert(Notification, notification)
    await setup.entityManager.insert(UserNotification, userNotification)

    const response = await request(setup.httpServer)
      .get(`/api/v1/me/notifications/${notification.uuid}`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body).toStrictEqual(expect.objectContaining({
      notificationUuid: notification.uuid
    }))
  })

  it('returns 403 when user does not have permission', async () => {
    const notification = new NotificationBuilder().build()
    const userNotification = new UserNotificationBuilder()
      .withChannel(NotificationChannel.APP)
      .withNotificationUuid(notification.uuid)
      .withUserUuid(userWithPermission.user.uuid)
      .build()

    await setup.entityManager.insert(Notification, notification)
    await setup.entityManager.insert(UserNotification, userNotification)

    const response = await request(setup.httpServer)
      .get(`/api/v1/me/notifications/${notification.uuid}`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
