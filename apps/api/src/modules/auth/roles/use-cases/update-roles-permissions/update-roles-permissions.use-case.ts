import assert from 'assert'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import { NotFoundCompositeApiError } from '@wisemen/api-error'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { UpdateRolesPermissionsRepository } from './update-roles-permissions.repository.js'
import { UpdateRolesPermissionsCommand } from './update-roles-permissions.command.js'
import { RolePermissionsUpdatedEvent } from './role-permissions-updated.event.js'
import { RoleNotEditableError } from '#src/modules/auth/roles/errors/role-not-editable.error.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'

@Injectable()
export class UpdateRolesPermissionsUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: UpdateRolesPermissionsRepository
  ) {}

  async updateRolePermissions (
    command: UpdateRolesPermissionsCommand
  ): Promise<void> {
    const roleUuids = command.roles.map(role => role.roleUuid)
    const roles = await this.repository.findRoles(roleUuids)

    const missingRoleUuids = roleUuids.filter((roleUuid) => {
      return !roles.some(role => role.uuid === roleUuid)
    })

    if (missingRoleUuids.length > 0) {
      const errors = missingRoleUuids.map(uuid => new RoleNotFoundError(uuid))

      throw new NotFoundCompositeApiError(errors)
    }

    const nonEditableRole = roles.find(role => role.isSystemAdmin)

    if (nonEditableRole !== undefined) {
      throw new RoleNotEditableError(nonEditableRole)
    }

    const events: RolePermissionsUpdatedEvent[] = []
    for (const role of roles) {
      const roleCommand = command.roles.find(c => c.roleUuid === role.uuid)

      assert(roleCommand !== undefined, 'Found role which should not exist')
      role.permissions = roleCommand.permissions
      events.push(new RolePermissionsUpdatedEvent(role))
    }

    await transaction(this.dataSource, async () => {
      await this.repository.updateRoles(roles)
      await this.eventEmitter.emit(events)
    })
  }
}
