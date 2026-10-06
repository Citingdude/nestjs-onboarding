import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { UserEvent } from '#src/modules/auth/users/events/user.event.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class RoleAssignedToUserEventContent {
  constructor (readonly userUuid: UserUuid, readonly roleUuid: RoleUuid) {}
}

@RegisterDomainEvent(DomainEventType.USER_ROLE_ASSIGNED, 1)
export class RoleAssignedToUserEvent extends UserEvent<RoleAssignedToUserEventContent> {
  constructor (userUuid: UserUuid, roleUuid: RoleUuid) {
    super({
      userUuid,
      content: new RoleAssignedToUserEventContent(userUuid, roleUuid)
    })
  }
}
