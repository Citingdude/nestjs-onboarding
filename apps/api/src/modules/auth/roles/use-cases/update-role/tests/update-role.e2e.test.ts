import { before, describe, it, after } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { DataSource } from 'typeorm'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestAuthContext } from '#src/modules/test-setup/test-auth-context.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UpdateRoleCommandBuilder } from '#src/modules/auth/roles/use-cases/update-role/update-role-command.builder.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Update role end to end tests', () => {
  let setup: TestSetup
  let dataSource: DataSource

  let context: TestAuthContext
  let defaultRole: Role
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    context = setup.authContext
    dataSource = setup.dataSource
    defaultRole = await context.getDefaultRole()

    userWithPermission = await context.getUser([Permission.ROLE_UPDATE])
    userWithoutPermission = await context.getUser([Permission.ROLE_READ])
  })

  after(async () => await setup.teardown())

  describe('Update role', () => {
    it('should update role', async () => {
      const role = new RoleBuilder()
        .withName('should-update-role')
        .build()

      await dataSource.manager.insert(Role, role)

      const command = new UpdateRoleCommandBuilder()
        .withName('should-update-role-test')
        .build()

      const response = await request(setup.httpServer)
        .post(`/api/v1/roles/${role.uuid}`)
        .set('Authorization', `Bearer ${userWithPermission.token}`)
        .send(command)

      expect(response).toHaveStatus(204)
      expect(response.body.name).not.toBe(role.name)
    })

    it('should not update role with invalid name', async () => {
      const command = new UpdateRoleCommandBuilder()
        .withName('')
        .build()

      const response = await request(setup.httpServer)
        .post(`/api/v1/roles/${defaultRole.uuid}`)
        .set('Authorization', `Bearer ${userWithPermission.token}`)
        .send(command)

      expect(response).toHaveStatus(400)
    })

    it('returns 403 when user does not have permission', async () => {
      const command = new UpdateRoleCommandBuilder()
        .withName('should-not-update-without-permission')
        .build()

      const response = await request(setup.httpServer)
        .post(`/api/v1/roles/${defaultRole.uuid}`)
        .set('Authorization', `Bearer ${userWithoutPermission.token}`)
        .send(command)

      expect(response).toHaveStatus(403)
    })
  })
})
