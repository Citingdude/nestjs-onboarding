import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { NotificationBuilder } from '#src/modules/notification/entities/notification.entity.builder.js'
import { UserNotificationBuilder } from '#src/modules/notification/entities/user-notification.entity.builder.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('View unread notifications count e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_OWN])
    userWithoutPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_CONFIG])
  })

  after(async () => {
    await setup.teardown()
  })

  it('returns the amount of unread notifications', async () => {
    const notification1 = new NotificationBuilder().build()
    const unreadNotification = new UserNotificationBuilder()
      .withChannel(NotificationChannel.APP)
      .withNotificationUuid(notification1.uuid)
      .withUserUuid(userWithPermission.user.uuid)
      .withReadAt(null)
      .build()

    const notification2 = new NotificationBuilder().build()
    const readNotification = new UserNotificationBuilder()
      .withChannel(NotificationChannel.APP)
      .withNotificationUuid(notification2.uuid)
      .withUserUuid(userWithPermission.user.uuid)
      .withReadAt(new Date())
      .build()

    await setup.entityManager.insert(Notification, [notification1, notification2])
    await setup.entityManager.insert(UserNotification, [unreadNotification, readNotification])

    const response = await request(setup.httpServer)
      .get(`/api/v1/me/notifications/unread-count`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body).toStrictEqual(expect.objectContaining({
      amount: 1,
      exceedsLimit: false
    }))
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/me/notifications/unread-count`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
