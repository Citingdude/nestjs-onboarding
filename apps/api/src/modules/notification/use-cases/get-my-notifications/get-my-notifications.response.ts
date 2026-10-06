import assert from 'assert'
import { ApiProperty } from '@nestjs/swagger'
import { OneOfApiExtraModels, OneOfApiProperty } from '@wisemen/one-of'
import type { PaginatedKeysetResponseMeta, PaginatedKeysetResponse } from '@wisemen/pagination'
import { GetMyNotificationsQueryKey } from './query/get-my-notifications.query.key.js'
import { NotificationResponse } from '#src/modules/notification/notification.response.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'

class GetMyNotificationsResponseMeta implements PaginatedKeysetResponseMeta {
  @ApiProperty({ type: GetMyNotificationsQueryKey, nullable: true })
  next: GetMyNotificationsQueryKey | null

  constructor (notifications: UserNotification[]) {
    this.next = GetMyNotificationsQueryKey.nextKey(notifications)
  }
}

@OneOfApiExtraModels(Notification)
export class GetMyNotificationsResponse implements PaginatedKeysetResponse {
  @OneOfApiProperty(Notification, { isArray: true })
  items: NotificationResponse[]

  @ApiProperty({ type: GetMyNotificationsResponseMeta })
  meta: GetMyNotificationsResponseMeta

  constructor (userNotifications: UserNotification[]) {
    const items = userNotifications.map((item) => {
      assert(item.notification, 'Notification should be populated')
      assert(item.notification.createdByUser !== undefined, 'CreatedByUser should be populated')
      return new NotificationResponse(item)
    })

    this.items = items
    this.meta = new GetMyNotificationsResponseMeta(userNotifications)
  }
}
