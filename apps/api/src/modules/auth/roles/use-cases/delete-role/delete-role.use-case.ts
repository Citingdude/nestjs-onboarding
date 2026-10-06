import { Injectable } from '@nestjs/common'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { DeleteRoleRepository } from './delete-role.repository.js'
import { RoleDeletedEvent } from './role-deleted.event.js'
import { RoleNotEditableError } from '#src/modules/auth/roles/errors/role-not-editable.error.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

@Injectable()
export class DeleteRoleUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: DeleteRoleRepository
  ) {}

  async execute (uuid: RoleUuid): Promise<void> {
    const role = await this.repository.findRole(uuid)

    if (role === null) {
      throw new RoleNotFoundError(uuid)
    }

    if (role.isSystemAdmin) {
      throw new RoleNotEditableError(role)
    }

    const event = new RoleDeletedEvent(role)

    await transaction(this.dataSource, async () => {
      await this.repository.delete(role)
      await this.eventEmitter.emitOne(event)
    })
  }
}
