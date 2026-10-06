import { generateUuid } from '@wisemen/nestjs-common'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class NotificationBuilder {
  private readonly notification: Notification

  constructor () {
    this.notification = new Notification()
    this.notification.createdAt = new Date()
    this.notification.uuid = generateUuid()
    this.notification.meta = {}
    this.notification.type = NotificationType.TEST_NOTIFICATION
  }

  withCreatedByUserUuid (createdByUserUuid: UserUuid | null): this {
    this.notification.createdByUserUuid = createdByUserUuid
    return this
  }

  withType (type: NotificationType): this {
    this.notification.type = type
    return this
  }

  withMeta (meta: object): this {
    this.notification.meta = meta
    return this
  }

  build (): Notification {
    return this.notification
  }
}
