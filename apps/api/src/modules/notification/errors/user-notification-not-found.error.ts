import { ApiErrorCode } from '@wisemen/api-error'
import { NotFoundApiError } from '@wisemen/api-error'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'

export class UserNotificationNotFoundError extends NotFoundApiError {
  @ApiErrorCode('user_notification_not_found')
  code = 'user_notification_not_found'

  meta: never

  constructor (notificationUuid: NotificationUuid) {
    super(`User notification with notification ${notificationUuid} not found`)
  }
}
