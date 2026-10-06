import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { GetOrCreateUserUseCase } from '#src/modules/auth/users/use-cases/get-or-create-user/get-or-create-user.use-case.js'
import { GetOrCreateUserRepository } from '#src/modules/auth/users/use-cases/get-or-create-user/get-or-create-user.repository.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { GetOrCreateUserCommandBuilder } from '#src/modules/auth/users/use-cases/get-or-create-user/get-or-create-user.command.builder.js'
import { UserCreatedEvent } from '#src/modules/auth/users/use-cases/get-or-create-user/user-created.event.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('Get or create user use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('does not create a new user when one already exists', async () => {
    const repository = createStubInstance(GetOrCreateUserRepository)

    repository.findById.resolves(new UserBuilder().build())

    const useCase = new GetOrCreateUserUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    const command = new GetOrCreateUserCommandBuilder().build()

    await useCase.getOrCreateUser(command)

    expect(repository.insert.called).toBe(false)
  })

  it('creates a new user when no user exists yet', async () => {
    const repository = createStubInstance(GetOrCreateUserRepository)

    repository.findById.resolves(null)

    const useCase = new GetOrCreateUserUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    const command = new GetOrCreateUserCommandBuilder().build()

    await useCase.getOrCreateUser(command)

    expect(repository.insert.called).toBe(true)
  })

  it('emits an event when a user is created', async () => {
    const repository = createStubInstance(GetOrCreateUserRepository)

    repository.findById.resolves(null)

    const eventEmitter = createStubInstance(DomainEventEmitter)
    const useCase = new GetOrCreateUserUseCase(
      stubDataSource(),
      eventEmitter,
      repository
    )

    const command = new GetOrCreateUserCommandBuilder().build()

    const user = await useCase.getOrCreateUser(command)

    expect(eventEmitter).toHaveEmitted(new UserCreatedEvent(user.uuid))
  })
})
