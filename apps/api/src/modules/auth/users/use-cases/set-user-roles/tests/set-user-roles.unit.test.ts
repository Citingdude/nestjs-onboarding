import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { assert, createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import { SetUserRolesUseCase } from '#src/modules/auth/users/use-cases/set-user-roles/set-user-roles.use-case.js'
import type { User } from '#src/modules/auth/users/entities/user.entity.js'
import { SetUserRolesCommandBuilder } from '#src/modules/auth/users/use-cases/set-user-roles/set-user-roles.command.builder.js'
import { UserRolesSetEvent } from '#src/modules/auth/users/use-cases/set-user-roles/user-roles-set.event.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { UserRoleCache } from '#src/modules/auth/users/cache/user-role/user-role-cache.js'
import type { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'

describe('Set user roles - unit test', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when the user is not found', async () => {
    const userRepo = createStubInstance(TypeOrmRepository<User>)

    userRepo.findOne.resolves(null)

    const useCase = new SetUserRolesUseCase(
      createStubInstance(TypeOrmRepository<UserRole>),
      userRepo,
      createStubInstance(TypeOrmRepository<Role>),
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      createStubInstance(UserRoleCache)
    )

    const command = new SetUserRolesCommandBuilder().build()

    await expect(
      useCase.execute(generateUuid(), command)
    ).rejects.toThrow(UserNotFoundError)
  })

  it('calls the insert and delete methods once', async () => {
    const userRoleRepo = createStubInstance(TypeOrmRepository<UserRole>)
    const userRepo = createStubInstance(TypeOrmRepository<User>)

    const user = new UserBuilder().build()
    user.userRoles = []

    userRepo.findOne.resolves(user)

    const useCase = new SetUserRolesUseCase(
      userRoleRepo,
      userRepo,
      createStubInstance(TypeOrmRepository<Role>),
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      createStubInstance(UserRoleCache)
    )

    const command = new SetUserRolesCommandBuilder().build()

    await useCase.execute(generateUuid(), command)

    assert.calledOnce(userRoleRepo.insert)
    assert.calledOnce(userRoleRepo.delete)
  })

  it('emits an event when the user\'s roles get updated', async () => {
    const userRepo = createStubInstance(TypeOrmRepository<User>)

    const user = new UserBuilder().build()
    user.userRoles = []

    userRepo.findOne.resolves(user)

    const roleRepo = createStubInstance(TypeOrmRepository<Role>)

    const role = new RoleBuilder().build()
    roleRepo.find.resolves([role])

    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new SetUserRolesUseCase(
      createStubInstance(TypeOrmRepository<UserRole>),
      userRepo,
      roleRepo,
      stubDataSource(),
      eventEmitter,
      createStubInstance(UserRoleCache)
    )

    const command = new SetUserRolesCommandBuilder()
      .withRoleUuids([role.uuid])
      .build()

    await useCase.execute(generateUuid(), command)

    expect(eventEmitter).toHaveEmitted(new UserRolesSetEvent(user.uuid, command.roleUuids))
  })
})
