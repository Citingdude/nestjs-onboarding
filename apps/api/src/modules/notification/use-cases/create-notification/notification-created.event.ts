import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEvent } from '@wisemen/nestjs-domain-events'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'

export class NotificationCreatedEventContent {
  constructor (readonly uuid: NotificationUuid, readonly type: NotificationType) {}
}

@RegisterDomainEvent(DomainEventType.NOTIFICATION_CREATED, 1)
export class NotificationCreatedEvent extends DomainEvent<NotificationCreatedEventContent> {
  constructor (uuid: NotificationUuid, type: NotificationType) {
    super({
      content: new NotificationCreatedEventContent(uuid, type)
    })
  }
}
