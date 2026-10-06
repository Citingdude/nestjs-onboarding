import { after, before, describe, it } from 'node:test'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { expect } from 'expect'
import { HttpStatus } from '@nestjs/common'
import { UpdateRolesPermissionsCommandBuilder } from './update-roles-permissions.command.builder.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'

describe('Update roles permissions e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.ROLE_UPDATE])
    userWithoutPermission = await setup.authContext.getUser([Permission.ROLE_READ])
  })

  after(async () => await setup.teardown())

  it('Updates the permissions of  roles', async () => {
    const role = new RoleBuilder()
      .withName(randomUUID())
      .build()

    await setup.entityManager.insert(Role, role)

    const command = new UpdateRolesPermissionsCommandBuilder()
      .addRole(role.uuid, [])
      .build()

    const response = await request(setup.httpServer)
      .patch(`/api/v1/roles`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(HttpStatus.NO_CONTENT)
  })

  it('returns 403 when user does not have permission', async () => {
    const role = new RoleBuilder()
      .withName(randomUUID())
      .build()

    await setup.entityManager.insert(Role, role)

    const command = new UpdateRolesPermissionsCommandBuilder()
      .addRole(role.uuid, [])
      .build()

    const response = await request(setup.httpServer)
      .patch(`/api/v1/roles`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
