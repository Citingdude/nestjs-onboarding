import { Injectable } from '@nestjs/common'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { CompleteTodoRepository } from './complete-todo.repository.js'
import { TodoCompletedEvent } from './todo-completed.event.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'

@Injectable()
export class CompleteTodoUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: CompleteTodoRepository
  ) {}

  public async execute (uuid: TodoUuid): Promise<void> {
    await transaction(this.dataSource, async () => {
      const todo = await this.repository.findTodo(uuid)
      if (todo === null) {
        throw new TodoNotFoundError(uuid)
      }

      if (todo.completed) {
        return
      }

      await this.repository.completeTodo(uuid)
      await this.eventEmitter.emit([new TodoCompletedEvent(uuid)])
    })
  }
}
