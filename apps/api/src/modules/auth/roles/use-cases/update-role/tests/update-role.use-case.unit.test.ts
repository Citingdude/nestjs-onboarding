import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'
import { UpdateRoleRepository } from '#src/modules/auth/roles/use-cases/update-role/update-role.repository.js'
import { UpdateRoleUseCase } from '#src/modules/auth/roles/use-cases/update-role/update-role.use-case.js'
import { UpdateRoleCommandBuilder } from '#src/modules/auth/roles/use-cases/update-role/update-role-command.builder.js'
import { RoleRenamedEvent } from '#src/modules/auth/roles/use-cases/update-role/role-renamed.event.js'
import { RoleNameAlreadyInUseError } from '#src/modules/auth/roles/errors/role-name-already-in-use.error.js'

describe('update role use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when the role does not exist', async () => {
    const repository = createStubInstance(UpdateRoleRepository)
    repository.findRole.resolves(null)

    const useCase = new UpdateRoleUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    const command = new UpdateRoleCommandBuilder().build()

    await expect(async () => await useCase.execute(generateUuid(), command))
      .rejects.toThrow(RoleNotFoundError)
  })

  it('throws an error when the name is already in use', async () => {
    const role = new RoleBuilder()
      .withIsSystemAdmin(true)
      .build()

    const repository = createStubInstance(UpdateRoleRepository)
    repository.findRole.resolves(role)
    repository.isNameAlreadyInUse.resolves(true)

    const useCase = new UpdateRoleUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    const command = new UpdateRoleCommandBuilder().build()

    await expect(async () => await useCase.execute(role.uuid, command))
      .rejects.toThrow(RoleNameAlreadyInUseError)
  })

  it('emits an event when the role has been updated', async () => {
    const role = new RoleBuilder().withName('name1').build()

    const repository = createStubInstance(UpdateRoleRepository)
    repository.findRole.resolves(role)
    repository.isNameAlreadyInUse.resolves(false)

    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new UpdateRoleUseCase(
      stubDataSource(),
      eventEmitter,
      repository
    )

    const command = new UpdateRoleCommandBuilder().withName('name2').build()
    await useCase.execute(role.uuid, command)

    // expected role update
    role.name = command.name

    expect(eventEmitter).toHaveEmitted(new RoleRenamedEvent(role, 'name1'))
  })
})
