import { Injectable } from '@nestjs/common'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { DataSource } from 'typeorm'
import { DeleteTodoRepository } from './delete-todo.repository.js'
import { TodoDeletedEvent } from './todo-deleted.event.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'

@Injectable()
export class DeleteTodoUseCase {
  constructor (
    private readonly datasource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: DeleteTodoRepository
  ) {}

  public async execute (uuid: TodoUuid): Promise<void> {
    await transaction(this.datasource, async () => {
      const deleted = await this.repository.deleteTodo(uuid)

      if (!deleted) {
        throw new TodoNotFoundError(uuid)
      }

      await this.eventEmitter.emit([new TodoDeletedEvent(uuid)])
    })
  }
}
