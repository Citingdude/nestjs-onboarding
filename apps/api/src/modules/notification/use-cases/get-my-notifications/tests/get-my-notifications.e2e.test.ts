import { after, before, describe, it } from 'node:test'
import { stringify } from 'qs'
import request from 'supertest'
import { expect } from 'expect'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { GetMyNotificationsQueryBuilder } from '#src/modules/notification/use-cases/get-my-notifications/query/get-my-notifications.query.builder.js'
import { NotificationBuilder } from '#src/modules/notification/entities/notification.entity.builder.js'
import { UserNotificationBuilder } from '#src/modules/notification/entities/user-notification.entity.builder.js'
import type { GetMyNotificationsQueryKey } from '#src/modules/notification/use-cases/get-my-notifications/query/get-my-notifications.query.key.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Get my notifications e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_OWN])
    userWithoutPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_CONFIG])

    const user = new UserBuilder().withEmail('user1@email.com').build()

    const notificationUser1 = new NotificationBuilder()
      .withType(NotificationType.USER_CREATED)
      .withMeta({ userName: 'John Doe' })
      .withCreatedByUserUuid(user.uuid)
      .build()

    const notification1Admin = new NotificationBuilder()
      .withType(NotificationType.USER_CREATED)
      .withMeta({ userName: 'John Doe' })
      .withCreatedByUserUuid(userWithPermission.user.uuid)
      .build()

    const notification2Admin = new NotificationBuilder()
      .withType(NotificationType.USER_CREATED)
      .withMeta({ userName: 'John Doe' })
      .withCreatedByUserUuid(userWithPermission.user.uuid)
      .build()

    const user1Notification = new UserNotificationBuilder()
      .withUserUuid(user.uuid)
      .withNotificationUuid(notificationUser1.uuid)
      .withChannel(NotificationChannel.APP)
      .build()

    const adminUserNotification1 = new UserNotificationBuilder()
      .withUserUuid(userWithPermission.user.uuid)
      .withNotificationUuid(notification1Admin.uuid)
      .withChannel(NotificationChannel.APP)
      .withReadAt(new Date())
      .build()

    const adminUserNotification2 = new UserNotificationBuilder()
      .withUserUuid(userWithPermission.user.uuid)
      .withNotificationUuid(notification2Admin.uuid)
      .withChannel(NotificationChannel.APP)
      .withReadAt(null)
      .build()

    await setup.entityManager.insert(User, user)
    await setup.entityManager.insert(Notification, [
      notificationUser1, notification1Admin, notification2Admin
    ])
    await setup.entityManager.insert(UserNotification, [
      user1Notification, adminUserNotification1, adminUserNotification2
    ])
  })

  after(async () => {
    await setup.teardown()
  })

  it('returns notifications', async () => {
    const query = new GetMyNotificationsQueryBuilder().build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/me/notifications`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(2)
  })

  it('returns the next notification when using the next key', async () => {
    const firstQuery = new GetMyNotificationsQueryBuilder()
      .withLimit(1)
      .build()

    const firstResponse = await request(setup.httpServer)
      .get(`/api/v1/me/notifications`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(firstQuery))

    expect(firstResponse).toHaveStatus(200)
    expect(firstResponse.body.items).toHaveLength(1)

    const secondQuery = new GetMyNotificationsQueryBuilder()
      .withKey(firstResponse.body.meta.next as GetMyNotificationsQueryKey)
      .withLimit(1)
      .build()

    const secondResponse = await request(setup.httpServer)
      .get(`/api/v1/me/notifications`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(secondQuery))

    expect(secondResponse).toHaveStatus(200)
    expect(secondResponse.body.items).toHaveLength(1)
  })

  it('returns notifications with filtered on onlyUnread', async () => {
    const query = new GetMyNotificationsQueryBuilder()
      .withOnlyUnread(true)
      .build()

    await expect(query).not.toHaveValidationErrors()

    const response = await request(setup.httpServer)
      .get(`/api/v1/me/notifications`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(1)
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/me/notifications`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
