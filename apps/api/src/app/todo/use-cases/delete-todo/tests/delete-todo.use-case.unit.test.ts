import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { DeleteTodoRepository } from '#src/app/todo/use-cases/delete-todo/delete-todo.repository.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { DeleteTodoUseCase } from '#src/app/todo/use-cases/delete-todo/delete-todo.use-case.js'
import { TodoDeletedEvent } from '#src/app/todo/use-cases/delete-todo/todo-deleted.event.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

describe('DeleteTodoUseCase Unit test', () => {
  before(() => {
    TestBench.setupUnitTest()
  })

  it('throws an error when the todo does not exist', async () => {
    const todoRepo = createStubInstance(DeleteTodoRepository)
    todoRepo.deleteTodo.resolves(false)

    const eventEmitter = createStubInstance(DomainEventEmitter)
    const useCase = new DeleteTodoUseCase(
      stubDataSource(),
      eventEmitter,
      todoRepo
    )

    const todoUuid = generateUuid<TodoUuid>()

    await expect(useCase.execute(todoUuid))
      .rejects.toThrow(new TodoNotFoundError(todoUuid))
    expect(eventEmitter.emit.called).toBe(false)
  })

  it('emits a todo deleted event', async () => {
    const todoRepo = createStubInstance(DeleteTodoRepository)
    todoRepo.deleteTodo.resolves(true)

    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new DeleteTodoUseCase(
      stubDataSource(),
      eventEmitter,
      todoRepo
    )

    const todoUuid = generateUuid<TodoUuid>()

    await useCase.execute(todoUuid)

    expect(todoRepo.deleteTodo.calledOnceWithExactly(todoUuid)).toBe(true)
    expect(eventEmitter).toHaveEmitted(new TodoDeletedEvent(todoUuid))
  })
})
