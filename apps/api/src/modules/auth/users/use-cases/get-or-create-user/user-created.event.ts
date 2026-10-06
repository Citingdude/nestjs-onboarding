import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserEvent } from '#src/modules/auth/users/events/user.event.js'

export class UserCreatedEventContent {
  constructor (readonly userUuid: UserUuid) {}
}

@RegisterDomainEvent(DomainEventType.USER_CREATED, 1)
export class UserCreatedEvent extends UserEvent<UserCreatedEventContent> {
  constructor (userUuid: UserUuid) {
    super({
      userUuid,
      content: new UserCreatedEventContent(userUuid)
    })
  }
}
