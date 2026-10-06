import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { AssignDefaultRoleToUserRepository } from './assign-default-role-to-user.repository.js'
import { RoleAssignedToUserEvent } from './role-assigned-to-user.event.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserRoleBuilder } from '#src/modules/auth/roles/entities/user-role.entity.builder.js'

@Injectable()
export class AssignDefaultRoleToUserUseCase {
  constructor (
    private dataSource: DataSource,
    private eventEmitter: DomainEventEmitter,
    private repository: AssignDefaultRoleToUserRepository
  ) {}

  async assignDefaultRole (toUserUuids: UserUuid[]): Promise<void> {
    if (toUserUuids.length === 0) {
      return
    }

    const defaultRole = await this.repository.getDefaultRole()

    if (defaultRole == null) {
      return
    }

    const userRoles: UserRole[] = []
    const events: RoleAssignedToUserEvent[] = []
    for (const userUuid of toUserUuids) {
      const userRole = new UserRoleBuilder()
        .withRoleUuid(defaultRole.uuid)
        .withUserUuid(userUuid)
        .build()

      userRoles.push(userRole)
      events.push(new RoleAssignedToUserEvent(userRole.userUuid, userRole.roleUuid))
    }

    await transaction(this.dataSource, async () => {
      await this.repository.insert(userRoles)
      await this.eventEmitter.emit(events)
    })
  }
}
