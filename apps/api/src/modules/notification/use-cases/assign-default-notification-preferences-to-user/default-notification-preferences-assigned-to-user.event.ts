import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserEvent } from '#src/modules/auth/users/events/user.event.js'

export class DefaultNotificationPreferencesAssignedToUserEventContent {
  constructor (readonly userUuid: UserUuid) {}
}

@RegisterDomainEvent(DomainEventType.USER_DEFAULT_NOTIFICATION_PREFERENCES_ASSIGNED, 1)
export class DefaultNotificationPreferencesAssignedToUserEvent
  extends UserEvent<DefaultNotificationPreferencesAssignedToUserEventContent> {
  constructor (userUuid: UserUuid) {
    super({
      userUuid,
      content: new DefaultNotificationPreferencesAssignedToUserEventContent(userUuid)
    })
  }
}
