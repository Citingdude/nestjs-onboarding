import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { UserEvent } from '#src/modules/auth/users/events/user.event.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class UserRolesSetEventContent {
  constructor (readonly userUuid: UserUuid, readonly roleUuids: RoleUuid[]) {}
}

@RegisterDomainEvent(DomainEventType.USER_ROLES_SET, 1)
export class UserRolesSetEvent extends UserEvent<UserRolesSetEventContent> {
  constructor (userUuid: UserUuid, roleUuids: RoleUuid[]) {
    super({
      userUuid,
      content: new UserRolesSetEventContent(userUuid, roleUuids)
    })
  }
}
