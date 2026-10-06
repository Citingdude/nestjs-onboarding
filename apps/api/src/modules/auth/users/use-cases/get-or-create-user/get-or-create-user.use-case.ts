import { Injectable } from '@nestjs/common'
import { DataSource, TypeORMError } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { GetOrCreateUserCommand } from './get-or-create-user.command.js'
import { GetOrCreateUserRepository } from './get-or-create-user.repository.js'
import { UserCreatedEvent } from './user-created.event.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { UserNotFoundAfterCreationError } from '#src/modules/auth/users/errors/user-not-found-after-creation.error.js'
import type { User } from '#src/modules/auth/users/entities/user.entity.js'

@Injectable()
export class GetOrCreateUserUseCase {
  constructor (
    private dataSource: DataSource,
    private eventEmitter: DomainEventEmitter,
    private readonly repository: GetOrCreateUserRepository
  ) {}

  async getOrCreateUser (command: GetOrCreateUserCommand): Promise<User> {
    let user = await this.repository.findById(command.id)

    if (user != null) {
      return user
    }

    user = new UserBuilder()
      .withEmail(command.email)
      .withFirstName(command.firstName)
      .withLastName(command.lastName)
      .withId(command.id)
      .build()

    try {
      await transaction(this.dataSource, async () => {
        await this.repository.insert(user)
        await this.eventEmitter.emitOne(new UserCreatedEvent(user.uuid))
      })
    } catch (e) {
      if (this.userHasBeenCreatedSimultaneously(e)) {
        return await this.refetchUser(command)
      } else {
        throw e
      }
    }

    return user
  }

  private async refetchUser (command: GetOrCreateUserCommand): Promise<User> {
    const user = await this.repository.findById(command.id)

    if (user != null) {
      return user
    } else {
      throw new UserNotFoundAfterCreationError()
    }
  }

  private userHasBeenCreatedSimultaneously (e: unknown): e is TypeORMError {
    return e instanceof TypeORMError
      && e.name === 'QueryFailedError'
      && e.message.startsWith('duplicate key')
  }
}
