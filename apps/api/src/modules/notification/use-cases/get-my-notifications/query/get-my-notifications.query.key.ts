import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsUUID } from 'class-validator'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'

export class GetMyNotificationsQueryKey {
  @ApiProperty({ format: 'datetime' })
  @IsISO8601({ strict: true })
  createdAt: string

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  notificationUuid: NotificationUuid

  static nextKey (notifications: UserNotification[]): GetMyNotificationsQueryKey | null {
    if (notifications.length == 0) {
      return null
    }

    const lastItem = notifications.at(-1) as UserNotification
    return this.from(lastItem)
  }

  static from (notification: UserNotification): GetMyNotificationsQueryKey {
    const key = new GetMyNotificationsQueryKey()
    key.createdAt = notification.createdAt.toISOString()
    key.notificationUuid = notification.notificationUuid
    return key
  }
}
