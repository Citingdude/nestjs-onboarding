import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { RoleEvent } from '#src/modules/auth/roles/events/role.event.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class RoleDeletedEventContent {
  readonly roleUuid: RoleUuid
  readonly roleName: string

  constructor (role: Role) {
    this.roleUuid = role.uuid
    this.roleName = role.name
  }
}

@RegisterDomainEvent(DomainEventType.ROLE_DELETED, 1)
export class RoleDeletedEvent extends RoleEvent<RoleDeletedEventContent> {
  constructor (role: Role) {
    super({
      roleUuid: role.uuid,
      content: new RoleDeletedEventContent(role)
    })
  }
}
