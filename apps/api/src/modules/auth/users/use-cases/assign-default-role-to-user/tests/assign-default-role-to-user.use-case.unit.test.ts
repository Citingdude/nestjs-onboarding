import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { AssignDefaultRoleToUserUseCase } from '#src/modules/auth/users/use-cases/assign-default-role-to-user/assign-default-role-to-user.use-case.js'
import { AssignDefaultRoleToUserRepository } from '#src/modules/auth/users/use-cases/assign-default-role-to-user/assign-default-role-to-user.repository.js'
import { RoleAssignedToUserEvent } from '#src/modules/auth/users/use-cases/assign-default-role-to-user/role-assigned-to-user.event.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'

describe('Assign default tole to user use case', () => {
  before(() => TestBench.setupUnitTest())

  it('assigns a role to the user', async () => {
    const repository = createStubInstance(AssignDefaultRoleToUserRepository)

    repository.getDefaultRole.resolves(new RoleBuilder().build())

    const useCase = new AssignDefaultRoleToUserUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    const userUuid = generateUuid<UserUuid>()

    await useCase.assignDefaultRole([userUuid])

    expect(repository.insert.called).toBe(true)
  })

  it('emits an event when a role has been assigned to a user', async () => {
    const role = new RoleBuilder().build()
    const repository = createStubInstance(AssignDefaultRoleToUserRepository)

    repository.getDefaultRole.resolves(role)

    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new AssignDefaultRoleToUserUseCase(
      stubDataSource(),
      eventEmitter,
      repository
    )

    const userUuid = generateUuid<UserUuid>()

    await useCase.assignDefaultRole([userUuid])

    expect(eventEmitter).toHaveEmitted(new RoleAssignedToUserEvent(userUuid, role.uuid))
  })
})
