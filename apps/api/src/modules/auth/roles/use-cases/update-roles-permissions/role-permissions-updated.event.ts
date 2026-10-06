import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import { RoleEvent } from '#src/modules/auth/roles/events/role.event.js'

export class RolePermissionsUpdatedEventContent {
  readonly roleUuid: RoleUuid
  readonly newPermissions: Permission[]
  readonly roleName: string

  constructor (role: Role) {
    this.roleUuid = role.uuid
    this.newPermissions = role.permissions
    this.roleName = role.name
  }
}

@RegisterDomainEvent(DomainEventType.ROLE_PERMISSIONS_UPDATED, 1)
export class RolePermissionsUpdatedEvent extends RoleEvent<RolePermissionsUpdatedEventContent> {
  constructor (role: Role) {
    super({
      roleUuid: role.uuid,
      content: new RolePermissionsUpdatedEventContent(role)
    })
  }
}
