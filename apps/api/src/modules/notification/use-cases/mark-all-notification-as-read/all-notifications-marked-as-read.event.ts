import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class AllNotificationsMarkedAsReadEventContent {
  constructor (readonly userUuid: UserUuid) {
  }
}

@RegisterDomainEvent(DomainEventType.NOTIFICATION_READ_ALL, 1)
export class AllNotificationMarkedAsReadEvent extends DomainEvent {
  constructor (userUuid: UserUuid) {
    super({
      content: new AllNotificationsMarkedAsReadEventContent(userUuid)
    })
  }
}
