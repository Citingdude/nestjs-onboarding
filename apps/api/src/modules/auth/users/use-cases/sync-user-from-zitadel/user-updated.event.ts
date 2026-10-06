import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserEvent } from '#src/modules/auth/users/events/user.event.js'

export class UserUpdatedEventContent {
  constructor (
    readonly userUuid: UserUuid,
    readonly firstName: string | null,
    readonly lastName: string | null
  ) {}
}

@RegisterDomainEvent(DomainEventType.USER_UPDATED, 1)
export class UserUpdatedEvent extends UserEvent<UserUpdatedEventContent> {
  constructor (
    userUuid: UserUuid,
    firstName: string | null,
    lastName: string | null
  ) {
    super({
      userUuid,
      content: new UserUpdatedEventContent(userUuid, firstName, lastName)
    })
  }
}
