import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class UserNotificationCreatedEventContent {
  readonly notificationUuid: NotificationUuid
  readonly channel: NotificationChannel
  readonly userUuid: UserUuid

  constructor (userNotification: UserNotification) {
    this.userUuid = userNotification.userUuid
    this.notificationUuid = userNotification.notificationUuid
    this.channel = userNotification.channel
  }
}

@RegisterDomainEvent(DomainEventType.USER_NOTIFICATION_CREATED, 1)
export class UserNotificationCreatedEvent extends DomainEvent<UserNotificationCreatedEventContent> {
  constructor (userNotification: UserNotification) {
    super({
      content: new UserNotificationCreatedEventContent(userNotification)
    })
  }
}
