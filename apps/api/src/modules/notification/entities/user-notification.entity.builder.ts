import type { NotificationUuid } from './notification.uuid.js'
import { UserNotification } from './user-notification.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'

export class UserNotificationBuilder {
  private readonly userNotification: UserNotification

  constructor () {
    this.userNotification = new UserNotification()
    this.userNotification.createdAt = new Date()
    this.userNotification.updatedAt = new Date()
    this.userNotification.readAt = null
  }

  withUserUuid (userUuid: UserUuid): this {
    this.userNotification.userUuid = userUuid
    return this
  }

  withNotificationUuid (notificationUuid: NotificationUuid): this {
    this.userNotification.notificationUuid = notificationUuid
    return this
  }

  withChannel (channel: NotificationChannel): this {
    this.userNotification.channel = channel
    return this
  }

  withReadAt (readAt: Date | null): this {
    this.userNotification.readAt = readAt
    return this
  }

  build (): UserNotification {
    return this.userNotification
  }
}
