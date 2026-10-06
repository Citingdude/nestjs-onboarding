import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { UpdateRoleCommand } from './update-role.command.js'
import { UpdateRoleRepository } from './update-role.repository.js'
import { RoleRenamedEvent } from './role-renamed.event.js'
import { RoleNameAlreadyInUseError } from '#src/modules/auth/roles/errors/role-name-already-in-use.error.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

@Injectable()
export class UpdateRoleUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: UpdateRoleRepository
  ) {}

  async execute (uuid: RoleUuid, command: UpdateRoleCommand): Promise<void> {
    const role = await this.repository.findRole(uuid)

    if (role === null) {
      throw new RoleNotFoundError(uuid)
    }

    if (await this.repository.isNameAlreadyInUse(command.name, role)) {
      throw new RoleNameAlreadyInUseError(command.name)
    }

    const previousName = role.name
    role.name = command.name
    const event = new RoleRenamedEvent(role, previousName)

    await transaction(this.dataSource, async () => {
      await this.repository.updateName(role)
      await this.eventEmitter.emitOne(event)
    })
  }
}
