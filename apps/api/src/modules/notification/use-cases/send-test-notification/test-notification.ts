import { ApiProperty } from '@nestjs/swagger'
import { OneOfMeta } from '@wisemen/one-of'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'

@OneOfMeta(Notification, NotificationType.TEST_NOTIFICATION)
export class TestNotificationContent {
  @ApiProperty({ type: 'string' })
  message: string

  constructor (message: string) {
    this.message = message
  }

  serialize (): Record<string, unknown> {
    return this as Record<string, unknown>
  }
}
