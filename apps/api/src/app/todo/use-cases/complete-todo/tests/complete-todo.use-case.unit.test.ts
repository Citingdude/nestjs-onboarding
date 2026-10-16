import { before, describe, it } from 'node:test'
import { assert, createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { CompleteTodoUseCase } from '#src/app/todo/use-cases/complete-todo/complete-todo.use-case.js'
import { CompleteTodoRepository } from '#src/app/todo/use-cases/complete-todo/complete-todo.repository.js'
import { TodoCompletedEvent } from '#src/app/todo/use-cases/complete-todo/todo-completed.event.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'
import { TodoBuilder } from '#src/app/todo/entities/todo.entity.builder.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('CompleteTodoUseCase unit tests', () => {
  before(() => {
    TestBench.setupUnitTest()
  })

  it('when the todo does not exist, throws without updating or emitting an event', async () => {
    const repository = createStubInstance(CompleteTodoRepository)
    repository.findTodo.resolves(null)
    const emitter = createStubInstance(DomainEventEmitter)
    const useCase = new CompleteTodoUseCase(stubDataSource(), emitter, repository)
    const uuid = generateUuid<TodoUuid>()

    await expect(useCase.execute(uuid)).rejects.toThrow(new TodoNotFoundError(uuid))

    assert.notCalled(repository.completeTodo)
    assert.notCalled(emitter.emit)
  })

  it('when the todo is incomplete, completes it before emitting the completed event', async () => {
    const todo = new TodoBuilder().build()
    const repository = createStubInstance(CompleteTodoRepository)
    repository.findTodo.resolves(todo)
    const emitter = createStubInstance(DomainEventEmitter)
    const useCase = new CompleteTodoUseCase(stubDataSource(), emitter, repository)

    await useCase.execute(todo.uuid)

    assert.calledOnceWithExactly(repository.findTodo, todo.uuid)
    assert.calledOnceWithExactly(repository.completeTodo, todo.uuid)
    expect(emitter).toHaveEmitted(new TodoCompletedEvent(todo.uuid))
    assert.callOrder(repository.completeTodo, emitter.emit)
  })

  it('when the todo is already completed, succeeds without writing or emitting an event', async () => {
    const todo = new TodoBuilder().withCompleted(true).build()
    const repository = createStubInstance(CompleteTodoRepository)
    repository.findTodo.resolves(todo)
    const emitter = createStubInstance(DomainEventEmitter)
    const useCase = new CompleteTodoUseCase(stubDataSource(), emitter, repository)

    await useCase.execute(todo.uuid)

    assert.notCalled(repository.completeTodo)
    assert.notCalled(emitter.emit)
  })

  it('when persistence fails, propagates the error without emitting an event', async () => {
    const todo = new TodoBuilder().build()
    const repository = createStubInstance(CompleteTodoRepository)
    repository.findTodo.resolves(todo)
    const error = new Error('Persistence failed')
    repository.completeTodo.rejects(error)
    const emitter = createStubInstance(DomainEventEmitter)
    const useCase = new CompleteTodoUseCase(stubDataSource(), emitter, repository)

    await expect(useCase.execute(todo.uuid)).rejects.toThrow(error)

    assert.notCalled(emitter.emit)
  })

  it('when event emission fails, propagates the error for transaction rollback', async () => {
    const todo = new TodoBuilder().build()
    const repository = createStubInstance(CompleteTodoRepository)
    repository.findTodo.resolves(todo)
    const emitter = createStubInstance(DomainEventEmitter)
    const error = new Error('Event emission failed')
    emitter.emit.rejects(error)
    const useCase = new CompleteTodoUseCase(stubDataSource(), emitter, repository)

    await expect(useCase.execute(todo.uuid)).rejects.toThrow(error)
  })
})
