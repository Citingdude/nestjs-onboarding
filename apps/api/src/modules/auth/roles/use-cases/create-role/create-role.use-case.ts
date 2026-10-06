import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { CreateRoleCommand } from './create-role.command.js'
import { CreateRoleRepository } from './create-role.repository.js'
import { RoleCreatedEvent } from './role-created.event.js'
import { CreateRoleResponse } from './create-role.response.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import { RoleNameAlreadyInUseError } from '#src/modules/auth/roles/errors/role-name-already-in-use.error.js'

@Injectable()
export class CreateRoleUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: CreateRoleRepository
  ) {}

  async execute (command: CreateRoleCommand): Promise<CreateRoleResponse> {
    if (await this.repository.isNameAlreadyInUse(command.name)) {
      throw new RoleNameAlreadyInUseError(command.name)
    }

    const role = new RoleBuilder()
      .withName(command.name)
      .build()

    const event = new RoleCreatedEvent(role)

    await transaction(this.dataSource, async () => {
      await this.repository.insert(role)
      await this.eventEmitter.emitOne(event)
    })

    return new CreateRoleResponse(role.uuid)
  }
}
