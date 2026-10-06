import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import { DeleteRoleUseCase } from '#src/modules/auth/roles/use-cases/delete-role/delete-role.use-case.js'
import { DeleteRoleRepository } from '#src/modules/auth/roles/use-cases/delete-role/delete-role.repository.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'
import { RoleDeletedEvent } from '#src/modules/auth/roles/use-cases/delete-role/role-deleted.event.js'
import { RoleNotEditableError } from '#src/modules/auth/roles/errors/role-not-editable.error.js'

describe('delete role use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when the role does not exist', async () => {
    const repository = createStubInstance(DeleteRoleRepository)
    repository.findRole.resolves(null)

    const useCase = new DeleteRoleUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    await expect(async () => await useCase.execute(generateUuid()))
      .rejects.toThrow(RoleNotFoundError)
  })

  it('throws an error when the role is the system admin', async () => {
    const role = new RoleBuilder()
      .withIsSystemAdmin(true)
      .build()

    const repository = createStubInstance(DeleteRoleRepository)
    repository.findRole.resolves(role)

    const useCase = new DeleteRoleUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    await expect(async () => await useCase.execute(generateUuid()))
      .rejects.toThrow(RoleNotEditableError)
  })

  it('emits an event when the role has been deleted', async () => {
    const role = new RoleBuilder().build()

    const repository = createStubInstance(DeleteRoleRepository)
    repository.findRole.resolves(role)

    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new DeleteRoleUseCase(
      stubDataSource(),
      eventEmitter,
      repository
    )

    await useCase.execute(generateUuid())

    expect(eventEmitter).toHaveEmitted(new RoleDeletedEvent(role))
  })
})
