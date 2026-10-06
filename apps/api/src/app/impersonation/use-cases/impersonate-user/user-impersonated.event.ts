import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserEvent } from '#src/modules/auth/users/events/user.event.js'

export class UserImpersonatedEventContent {
  readonly targetUserUuid: UserUuid
  readonly actingUserUuid: UserUuid

  constructor (targetUserUuid: UserUuid, actingUserUuid: UserUuid) {
    this.targetUserUuid = targetUserUuid
    this.actingUserUuid = actingUserUuid
  }
}

@RegisterDomainEvent(DomainEventType.USER_IMPERSONATED, 1)
export class UserImpersonatedEvent extends UserEvent<UserImpersonatedEventContent> {
  constructor (targetUserUuid: UserUuid, actingUserUuid: UserUuid) {
    super({
      userUuid: targetUserUuid,
      content: new UserImpersonatedEventContent(targetUserUuid, actingUserUuid)
    })
  }
}
