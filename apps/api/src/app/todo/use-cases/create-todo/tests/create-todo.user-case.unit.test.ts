import { before, describe, it } from 'node:test'
import { createStubInstance, assert, match } from 'sinon'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { expect } from 'expect'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { CreateTodoRepository } from '#src/app/todo/use-cases/create-todo/create-todo.repository.js'
import { CreateTodoUseCase } from '#src/app/todo/use-cases/create-todo/create-todo.use-case.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { TodoBuilder } from '#src/app/todo/entities/todo.entity.builder.js'
import { TodoCreatedEvent } from '#src/app/todo/use-cases/create-todo/todo-created.event.js'
import { CreateTodoCommandBuilder } from '#src/app/todo/use-cases/create-todo/tests/create-todo.command.builder.js'

describe('CreateTodoUseCase Unit test', () => {
  before(() => {
    TestBench.setupUnitTest()
  })

  it('inserts the created todo', async () => {
    const eventEmitter = createStubInstance(DomainEventEmitter)
    const repository = createStubInstance(CreateTodoRepository)

    const useCase = new CreateTodoUseCase(stubDataSource(), repository, eventEmitter)

    const command = new CreateTodoCommandBuilder().build()
    const userUuid = generateUuid<UserUuid>()

    await useCase.execute(command, userUuid)

    assert.calledOnce(repository.insert)

    assert.calledWith(repository.insert, match({
      userUuid,
      title: command.title,
      description: command.description,
      deadline: command.deadline,
      completed: false
    }))
  })

  it('emits a todo created event', async () => {
    const eventEmitter = createStubInstance(DomainEventEmitter)
    const repository = createStubInstance(CreateTodoRepository)

    const useCase = new CreateTodoUseCase(stubDataSource(), repository, eventEmitter)

    const command = new CreateTodoCommandBuilder().build()
    const userUuid = generateUuid<UserUuid>()

    const { uuid } = await useCase.execute(command, userUuid)

    const expectedTodo = new TodoBuilder()
      .withUuid(uuid)
      .withUserUuid(userUuid)
      .withTitle(command.title)
      .withDescription(command.description)
      .withDeadline(command.deadline)
      .build()

    const expectedEvent = new TodoCreatedEvent(expectedTodo)

    expect(eventEmitter).toHaveEmitted(expectedEvent)
  })
})
