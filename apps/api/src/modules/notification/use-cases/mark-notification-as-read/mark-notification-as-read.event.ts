import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class NotificationReadEventContent {
  constructor (readonly notificationUuid: NotificationUuid, readonly userUuid: UserUuid) {}
}

@RegisterDomainEvent(DomainEventType.NOTIFICATION_READ, 1)
export class NotificationReadEvent extends DomainEvent {
  constructor (notificationUuid: NotificationUuid, userUuid: UserUuid) {
    super({
      content: new NotificationReadEventContent(notificationUuid, userUuid)
    })
  }
}
