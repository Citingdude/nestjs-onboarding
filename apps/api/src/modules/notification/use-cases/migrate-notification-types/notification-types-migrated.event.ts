import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEvent } from '@wisemen/nestjs-domain-events'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'

export class NotificationTypesMigratedEventContent {
  constructor (readonly types: NotificationType[]) {}
}

@RegisterDomainEvent(DomainEventType.NOTIFICATION_TYPES_MIGRATED, 1)
export class NotificationTypesMigratedEvent extends DomainEvent {
  constructor (types: NotificationType[]) {
    super({
      content: new NotificationTypesMigratedEventContent(types)
    })
  }
}
