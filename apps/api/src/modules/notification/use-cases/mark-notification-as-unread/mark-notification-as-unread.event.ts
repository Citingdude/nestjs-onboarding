import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'

export class NotificationUnreadEventContent {
  constructor (readonly notificationUuid: NotificationUuid, readonly userUuid: UserUuid) {}
}

@RegisterDomainEvent(DomainEventType.NOTIFICATION_UNREAD, 1)
export class NotificationUnreadEvent extends DomainEvent {
  constructor (notificationUuid: NotificationUuid, userUuid: UserUuid) {
    super({
      content: new NotificationUnreadEventContent(notificationUuid, userUuid)
    })
  }
}
