import { before, describe, it } from 'node:test'
import { assert, createStubInstance, match } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { UpdateTodoCommandBuilder } from './update-todo.command.builder.js'
import { UpdateTodoUseCase } from '#src/app/todo/use-cases/update-todo/update-todo.use-case.js'
import { UpdateTodoRepository } from '#src/app/todo/use-cases/update-todo/update-todo.repository.js'
import { TodoUpdatedEvent } from '#src/app/todo/use-cases/update-todo/todo-updated.event.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'
import { TodoBuilder } from '#src/app/todo/entities/todo.entity.builder.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('UpdateTodoUseCase unit tests', () => {
  before(() => {
    TestBench.setupUnitTest()
  })

  it('when the todo does not exist, throws without saving or emitting an event', async () => {
    const repository = createStubInstance(UpdateTodoRepository)
    repository.findTodo.resolves(null)
    const emitter = createStubInstance(DomainEventEmitter)
    const useCase = new UpdateTodoUseCase(stubDataSource(), emitter, repository)
    const uuid = generateUuid<TodoUuid>()

    await expect(useCase.execute(uuid, new UpdateTodoCommandBuilder().build()))
      .rejects.toThrow(new TodoNotFoundError(uuid))

    assert.notCalled(repository.updateTodo)
    assert.notCalled(emitter.emit)
  })

  it('when updating, saves editable fields and preserves the assigned user', async () => {
    const userUuid = generateUuid<UserUuid>()
    const todo = new TodoBuilder().withUserUuid(userUuid).build()
    const repository = createStubInstance(UpdateTodoRepository)
    repository.findTodo.resolves(todo)
    const emitter = createStubInstance(DomainEventEmitter)
    const useCase = new UpdateTodoUseCase(stubDataSource(), emitter, repository)
    const deadline = new Date().toISOString()
    const command = new UpdateTodoCommandBuilder()
      .withTitle('Updated title')
      .withDescription('Updated description')
      .withDeadline(deadline)
      .withCompleted(true)
      .build()

    await useCase.execute(todo.uuid, command)

    assert.calledOnceWithExactly(repository.updateTodo, match({
      uuid: todo.uuid,
      userUuid,
      title: command.title,
      description: command.description,
      deadline: new Date(deadline),
      completed: true
    }))
    expect(emitter).toHaveEmitted(new TodoUpdatedEvent(todo.uuid))
    assert.callOrder(repository.updateTodo, emitter.emit)
  })

  it('when nullable fields are cleared, saves nulls and can reopen a completed todo', async () => {
    const todo = new TodoBuilder()
      .withDescription('Before')
      .withDeadline(new Date())
      .withCompleted(true)
      .build()
    const repository = createStubInstance(UpdateTodoRepository)
    repository.findTodo.resolves(todo)
    const useCase = new UpdateTodoUseCase(
      stubDataSource(), createStubInstance(DomainEventEmitter), repository
    )

    await useCase.execute(todo.uuid, new UpdateTodoCommandBuilder().build())

    assert.calledWithMatch(repository.updateTodo, {
      description: null, deadline: null, completed: false
    })
  })

  it('when persistence fails, propagates the error without emitting an event', async () => {
    const todo = new TodoBuilder().build()
    const repository = createStubInstance(UpdateTodoRepository)
    repository.findTodo.resolves(todo)
    const error = new Error('Persistence failed')
    repository.updateTodo.rejects(error)
    const emitter = createStubInstance(DomainEventEmitter)
    const useCase = new UpdateTodoUseCase(stubDataSource(), emitter, repository)

    await expect(useCase.execute(todo.uuid, new UpdateTodoCommandBuilder().build()))
      .rejects.toThrow(error)

    assert.notCalled(emitter.emit)
  })

  it('when event emission fails, propagates the error for transaction rollback', async () => {
    const todo = new TodoBuilder().build()
    const repository = createStubInstance(UpdateTodoRepository)
    repository.findTodo.resolves(todo)
    const emitter = createStubInstance(DomainEventEmitter)
    const error = new Error('Event emission failed')
    emitter.emit.rejects(error)
    const useCase = new UpdateTodoUseCase(stubDataSource(), emitter, repository)

    await expect(useCase.execute(todo.uuid, new UpdateTodoCommandBuilder().build()))
      .rejects.toThrow(error)
  })
})
