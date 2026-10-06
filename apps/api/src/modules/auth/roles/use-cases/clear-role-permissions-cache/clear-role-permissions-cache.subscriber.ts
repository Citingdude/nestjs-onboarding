import { Injectable } from '@nestjs/common'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { ClearRolePermissionsCacheUseCase } from './clear-role-permissions-cache.use-case.js'
import { RolePermissionsUpdatedEvent } from '#src/modules/auth/roles/use-cases/update-roles-permissions/role-permissions-updated.event.js'
import { RoleDeletedEvent } from '#src/modules/auth/roles/use-cases/delete-role/role-deleted.event.js'

@Injectable()
export class ClearRolePermissionsCacheSubscriber {
  constructor (
    private readonly useCase: ClearRolePermissionsCacheUseCase
  ) {}

  @Subscribe(RoleDeletedEvent)
  @Subscribe(RolePermissionsUpdatedEvent)
  async onEvents (events: Array<RoleDeletedEvent | RolePermissionsUpdatedEvent>): Promise<void> {
    const roleUuids = events.map(event => event.content.roleUuid)
    await this.useCase.execute(roleUuids)
  }
}
