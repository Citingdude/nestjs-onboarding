import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { DataSource } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import { Injectable } from '@nestjs/common'
import { CreateTodoCommand } from '#src/app/todo/use-cases/create-todo/create-todo.command.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { CreateTodoResponse } from '#src/app/todo/use-cases/create-todo/create-todo.response.js'
import { TodoBuilder } from '#src/app/todo/entities/todo.entity.builder.js'
import { CreateTodoRepository } from '#src/app/todo/use-cases/create-todo/create-todo.repository.js'
import { TodoCreatedEvent } from '#src/app/todo/use-cases/create-todo/todo-created.event.js'

@Injectable()
export class CreateTodoUseCase {
  constructor (
    private datasource: DataSource,
    private repository: CreateTodoRepository,
    private emitter: DomainEventEmitter
  ) {}

  async execute (command: CreateTodoCommand, userUuid: UserUuid): Promise<CreateTodoResponse> {
    const todo = new TodoBuilder()
      .withUserUuid(userUuid)
      .withTitle(command.title)
      .withDescription(command.description)
      .withDeadline(command.deadline)
      .build()

    const event = new TodoCreatedEvent(todo)

    await transaction(this.datasource, async () => {
      await this.repository.insert(todo)
      await this.emitter.emit([event])
    })

    return new CreateTodoResponse(todo)
  }
}
