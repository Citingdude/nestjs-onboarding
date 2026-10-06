import assert from 'assert'
import { ApiProperty } from '@nestjs/swagger'
import { OneOfMetaApiProperty, OneOfResponse, OneOfTypeApiProperty } from '@wisemen/one-of'
import { NotificationType } from './enums/notification-types.enum.js'
import { Notification } from './entities/notification.entity.js'
import { UserNotification } from './entities/user-notification.entity.js'
import type { NotificationUuid } from './entities/notification.uuid.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { tc } from '#src/modules/localization/helpers/translate.helper.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

class CreatedByUserResponse {
  @ApiProperty({ format: 'uuid' })
  uuid: UserUuid

  @ApiProperty()
  name: string

  constructor (user: User) {
    this.uuid = user.uuid
    this.name = user.fullName
  }
}

@OneOfResponse(Notification)
export class NotificationResponse {
  @ApiProperty({ format: 'date-time' })
  createdAt: string

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  readAt: string | null

  @ApiProperty({ format: 'uuid' })
  notificationUuid: NotificationUuid

  @ApiProperty({ type: CreatedByUserResponse, nullable: true })
  createdByUser: CreatedByUserResponse | null

  @ApiProperty()
  message: string

  @OneOfTypeApiProperty()
  type: NotificationType

  @OneOfMetaApiProperty()
  meta: object

  constructor (userNotification: UserNotification, language?: Locale) {
    assert(userNotification.notification !== undefined, new Error('notification not loaded'))
    assert(userNotification.notification.createdByUser !== undefined, new Error('createdByUser not loaded'))

    this.createdAt = userNotification.notification.createdAt.toISOString()
    this.createdByUser = userNotification.notification.createdByUser
      ? new CreatedByUserResponse(userNotification.notification.createdByUser)
      : null
    this.message = this.getMessage(userNotification.notification, language)
    this.readAt = userNotification.readAt?.toISOString() ?? null
    this.type = userNotification.notification.type
    this.meta = userNotification.notification.meta
    this.notificationUuid = userNotification.notification.uuid
  }

  private getMessage (notification: Notification, lang?: Locale): string {
    return tc(`notifications.${notification.type}.content`, { lang })
  }
}
