import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'
import { NotificationBuilder } from '#src/modules/notification/entities/notification.entity.builder.js'
import { UserNotificationBuilder } from '#src/modules/notification/entities/user-notification.entity.builder.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Mark notification as read e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.NOTIFICATION_UPDATE_READ])
    userWithoutPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_OWN])
  })

  after(async () => {
    await setup.teardown()
  })

  it('should register the readAt of a user notification', async () => {
    const notification = new NotificationBuilder()
      .withType(NotificationType.USER_CREATED)
      .withCreatedByUserUuid(userWithPermission.user.uuid)
      .build()

    const userNotification = new UserNotificationBuilder()
      .withUserUuid(userWithPermission.user.uuid)
      .withNotificationUuid(notification.uuid)
      .withChannel(NotificationChannel.APP)
      .withReadAt(new Date())
      .build()

    await setup.entityManager.insert(Notification, notification)
    await setup.entityManager.insert(UserNotification, userNotification)

    const response = await request(setup.httpServer)
      .patch(`/api/v1/me/notifications/${notification.uuid}/mark-as-read`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(204)

    const updatedUserNotification = await setup.entityManager.findOneOrFail(UserNotification, {
      where: {
        notificationUuid: notification.uuid,
        userUuid: userWithPermission.user.uuid,
        channel: NotificationChannel.APP
      }
    })

    expect(updatedUserNotification?.readAt).not.toBe(null)
  })

  it('returns 403 when user does not have permission', async () => {
    const notification = new NotificationBuilder()
      .withType(NotificationType.USER_CREATED)
      .withCreatedByUserUuid(userWithPermission.user.uuid)
      .build()

    await setup.entityManager.insert(Notification, notification)

    const response = await request(setup.httpServer)
      .patch(`/api/v1/me/notifications/${notification.uuid}/mark-as-read`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
