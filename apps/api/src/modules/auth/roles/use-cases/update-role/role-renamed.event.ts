import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { RoleEvent } from '#src/modules/auth/roles/events/role.event.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class RoleRenamedEventContent {
  readonly roleUuid: RoleUuid
  readonly previousName: string
  readonly newName: string

  constructor (role: Role, previousName: string) {
    this.roleUuid = role.uuid
    this.newName = role.name
    this.previousName = previousName
  }
}

@RegisterDomainEvent(DomainEventType.ROLE_RENAMED, 1)
export class RoleRenamedEvent extends RoleEvent<RoleRenamedEventContent> {
  constructor (role: Role, previousName: string) {
    super({
      roleUuid: role.uuid,
      content: new RoleRenamedEventContent(role, previousName)
    })
  }
}
