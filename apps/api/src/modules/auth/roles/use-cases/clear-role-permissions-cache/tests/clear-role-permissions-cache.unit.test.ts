import { before, describe, it } from 'node:test'
import { randomUUID } from 'node:crypto'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { ClearRolePermissionsCacheUseCase } from '#src/modules/auth/roles/use-cases/clear-role-permissions-cache/clear-role-permissions-cache.use-case.js'
import { RoleCache } from '#src/modules/auth/roles/cache/role-cache.js'
import { RolePermissionsCacheClearedEvent } from '#src/modules/auth/roles/use-cases/clear-role-permissions-cache/role-permissions-cache-cleared.event.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

describe('clear role permissions cache use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('clears the cache for the given roles', async () => {
    const repository = createStubInstance(TypeOrmRepository)
    const cache = createStubInstance(RoleCache)

    const useCase = new ClearRolePermissionsCacheUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      cache,
      repository
    )

    const rolesToClear = [generateUuid<RoleUuid>()]
    await useCase.execute(rolesToClear)

    expect(cache.clearRolesPermissions.firstCall.firstArg).toStrictEqual(rolesToClear)
    expect(repository.find.called).toBe(false)
  })

  it('clears the cache for all roles when no roles are given', async () => {
    const allRoles = [
      { uuid: randomUUID() },
      { uuid: randomUUID() }
    ]

    const repository = createStubInstance(TypeOrmRepository)
    repository.find.resolves(allRoles)
    const cache = createStubInstance(RoleCache)

    const useCase = new ClearRolePermissionsCacheUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      cache,
      repository
    )

    await useCase.execute()

    const rolesToClear = allRoles.map(role => role.uuid)
    expect(cache.clearRolesPermissions.firstCall.firstArg).toStrictEqual(rolesToClear)
  })

  it('emits an event after clearing the roles', async () => {
    const allRoles = [
      { uuid: randomUUID() },
      { uuid: randomUUID() }
    ]

    const repository = createStubInstance(TypeOrmRepository)
    repository.find.resolves(allRoles)
    const cache = createStubInstance(RoleCache)
    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new ClearRolePermissionsCacheUseCase(
      stubDataSource(),
      eventEmitter,
      cache,
      repository
    )

    await useCase.execute()

    const rolesToClear = allRoles.map(role => role.uuid)
    expect(eventEmitter).toHaveEmitted(new RolePermissionsCacheClearedEvent(rolesToClear))
  })
})
