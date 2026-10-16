import { Injectable } from '@nestjs/common'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { UncompleteTodoRepository } from './uncomplete-todo.repository.js'
import { TodoUncompletedEvent } from './todo-uncompleted.event.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'

@Injectable()
export class UncompleteTodoUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: UncompleteTodoRepository
  ) {}

  public async execute (uuid: TodoUuid): Promise<void> {
    await transaction(this.dataSource, async () => {
      const todo = await this.repository.findTodo(uuid)
      if (todo === null) {
        throw new TodoNotFoundError(uuid)
      }

      if (!todo.completed) {
        return
      }

      await this.repository.uncompleteTodo(uuid)
      await this.eventEmitter.emit([new TodoUncompletedEvent(uuid)])
    })
  }
}
