import { Injectable } from '@nestjs/common'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { UpdateTodoCommand } from './update-todo.command.js'
import { UpdateTodoRepository } from './update-todo.repository.js'
import { TodoUpdatedEvent } from './todo-updated.event.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'

@Injectable()
export class UpdateTodoUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: UpdateTodoRepository
  ) {}

  public async execute (uuid: TodoUuid, command: UpdateTodoCommand): Promise<void> {
    await transaction(this.dataSource, async () => {
      const todo = await this.repository.findTodo(uuid)
      if (todo === null) {
        throw new TodoNotFoundError(uuid)
      }

      todo.title = command.title ?? todo.title
      todo.description = command.description
      todo.deadline = command.deadline === null ? null : new Date(command.deadline)
      todo.completed = command.completed ?? todo.completed

      await this.repository.updateTodo(todo)
      await this.eventEmitter.emit([new TodoUpdatedEvent(uuid)])
    })
  }
}
