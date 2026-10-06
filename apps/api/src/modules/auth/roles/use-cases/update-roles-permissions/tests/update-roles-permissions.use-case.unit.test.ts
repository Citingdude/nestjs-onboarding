import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { NotFoundCompositeApiError } from '@wisemen/api-error'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { UpdateRolesPermissionsCommandBuilder } from './update-roles-permissions.command.builder.js'
import { UpdateRolesPermissionsUseCase } from '#src/modules/auth/roles/use-cases/update-roles-permissions/update-roles-permissions.use-case.js'
import { UpdateRolesPermissionsRepository } from '#src/modules/auth/roles/use-cases/update-roles-permissions/update-roles-permissions.repository.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'
import { RolePermissionsUpdatedEvent } from '#src/modules/auth/roles/use-cases/update-roles-permissions/role-permissions-updated.event.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { RoleNotEditableError } from '#src/modules/auth/roles/errors/role-not-editable.error.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'

describe('Update role permissions use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when a role does not exist', async () => {
    const repository = createStubInstance(UpdateRolesPermissionsRepository)

    repository.findRoles.resolves([])

    const useCase = new UpdateRolesPermissionsUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    const roleUuid = generateUuid<RoleUuid>()
    const command = new UpdateRolesPermissionsCommandBuilder()
      .addRole(roleUuid, [])
      .build()

    await expect(useCase.updateRolePermissions(command)).rejects.toThrow(
      new NotFoundCompositeApiError([new RoleNotFoundError(roleUuid)])
    )
  })

  it('throws an error when a system admin role is changed', async () => {
    const repository = createStubInstance(UpdateRolesPermissionsRepository)

    const nonEditableRole = new RoleBuilder()
      .withIsSystemAdmin(true)
      .build()

    repository.findRoles.resolves([nonEditableRole])

    const useCase = new UpdateRolesPermissionsUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repository
    )

    const command = new UpdateRolesPermissionsCommandBuilder()
      .addRole(nonEditableRole.uuid, [])
      .build()

    await expect(useCase.updateRolePermissions(command)).rejects.toThrow(
      new RoleNotEditableError(nonEditableRole)
    )
  })

  it('emits an event for each role', async () => {
    const role1Uuid = generateUuid<RoleUuid>()
    const role2Uuid = generateUuid<RoleUuid>()

    const repository = createStubInstance(UpdateRolesPermissionsRepository)
    const roles = [
      new RoleBuilder()
        .withUuid(role1Uuid)
        .build(),
      new RoleBuilder()
        .withUuid(role2Uuid)
        .build()
    ]

    repository.findRoles.resolves(roles)

    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new UpdateRolesPermissionsUseCase(
      stubDataSource(),
      eventEmitter,
      repository
    )

    const command = new UpdateRolesPermissionsCommandBuilder()
      .addRole(role1Uuid, [])
      .addRole(role2Uuid, [])
      .build()

    await useCase.updateRolePermissions(command)
    expect(eventEmitter).toHaveEmitted(new RolePermissionsUpdatedEvent(roles[0]))
    expect(eventEmitter).toHaveEmitted(new RolePermissionsUpdatedEvent(roles[1]))
  })
})
