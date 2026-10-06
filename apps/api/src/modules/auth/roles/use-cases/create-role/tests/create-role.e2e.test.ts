import { before, describe, it, after } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { CreateRoleCommandBuilder } from '#src/modules/auth/roles/use-cases/create-role/create-role.command.builder.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Create role end to end tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.ROLE_CREATE])
    userWithoutPermission = await setup.authContext.getUser([Permission.ROLE_READ])
  })

  after(async () => await setup.teardown())

  it('creates role', async () => {
    const command = new CreateRoleCommandBuilder()
      .withName('should-create-role-test')
      .build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/roles`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(201)
  })

  it('returns 403 when user does not have permission', async () => {
    const command = new CreateRoleCommandBuilder()
      .withName('should-fail-without-permission')
      .build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/roles`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })

  it('returns an error when the name of a role has already been taken', async () => {
    const existingRole = new RoleBuilder().withName('JohnDoesRole').build()
    await setup.entityManager.insert(Role, existingRole)

    const command = new CreateRoleCommandBuilder()
      .withName(existingRole.name)
      .build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/roles`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(409)
    expect(response).toHaveErrorCode('role_name_already_in_use')
  })

  it('does not create role with an empty name', async () => {
    const command = new CreateRoleCommandBuilder()
      .withName('')
      .build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/roles`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(400)
  })
})
