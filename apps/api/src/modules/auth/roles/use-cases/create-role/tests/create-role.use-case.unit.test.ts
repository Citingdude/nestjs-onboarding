import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { CreateRoleUseCase } from '#src/modules/auth/roles/use-cases/create-role/create-role.use-case.js'
import { CreateRoleRepository } from '#src/modules/auth/roles/use-cases/create-role/create-role.repository.js'
import { CreateRoleCommandBuilder } from '#src/modules/auth/roles/use-cases/create-role/create-role.command.builder.js'
import { RoleNameAlreadyInUseError } from '#src/modules/auth/roles/errors/role-name-already-in-use.error.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import { RoleCreatedEvent } from '#src/modules/auth/roles/use-cases/create-role/role-created.event.js'

describe('create role use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when the role name is already in use', async () => {
    const repository = createStubInstance(CreateRoleRepository)
    repository.isNameAlreadyInUse.resolves(true)

    const useCase = new CreateRoleUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    const command = new CreateRoleCommandBuilder().build()

    await expect(async () => await useCase.execute(command))
      .rejects.toThrow(RoleNameAlreadyInUseError)
  })

  it('emits an event when the role has been created', async () => {
    const repository = createStubInstance(CreateRoleRepository)
    repository.isNameAlreadyInUse.resolves(false)
    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new CreateRoleUseCase(
      stubDataSource(),
      eventEmitter,
      repository
    )

    const command = new CreateRoleCommandBuilder().build()
    const response = await useCase.execute(command)

    const expectedRole = new RoleBuilder()
      .withName(command.name)
      .withUuid(response.uuid)
      .build()

    expect(eventEmitter).toHaveEmitted(new RoleCreatedEvent(expectedRole))
  })
})
