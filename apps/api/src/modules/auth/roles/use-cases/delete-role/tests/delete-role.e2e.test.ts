import { before, describe, it, after } from 'node:test'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { expect } from 'expect'
import { Any, type DataSource } from 'typeorm'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UserRepository } from '#src/modules/auth/users/repositories/user.repository.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import type { TestAuthContext } from '#src/modules/test-setup/test-auth-context.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import { UserRoleBuilder } from '#src/modules/auth/roles/entities/user-role.entity.builder.js'

describe('Delete role end to end tests', () => {
  let setup: TestSetup
  let dataSource: DataSource
  let context: TestAuthContext
  let adminRole: Role
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    context = setup.authContext
    dataSource = setup.dataSource
    adminRole = await context.getAdminRole()
    userWithPermission = await context.getUser([Permission.ROLE_DELETE])
    userWithoutPermission = await context.getUser([Permission.ROLE_READ])
  })

  after(async () => await setup.teardown())

  describe('Delete role', () => {
    it('should return 400 when deleting admin role', async () => {
      const response = await request(setup.httpServer)
        .delete(`/api/v1/roles/${adminRole.uuid}`)
        .set('Authorization', `Bearer ${userWithPermission.token}`)

      expect(response.body.errors[0].code).toBe('role_not_editable')
      expect(response.body.errors[0].detail).toBe('This role is not editable')

      expect(response).toHaveStatus(400)
    })

    it('should delete role', async () => {
      const role = new RoleBuilder()
        .withName('should-delete-role-with-staff')
        .build()

      await dataSource.manager.insert(Role, role)

      const users = [
        new UserBuilder()
          .withEmail(randomUUID() + '@mail.com')
          .build(),
        new UserBuilder()
          .withEmail(randomUUID() + '@mail.com')
          .build(),
        new UserBuilder()
          .withEmail(randomUUID() + '@mail.com')
          .build()
      ]

      await dataSource.manager.insert(User, users)

      const userRoles: UserRole[] = users.map((user) => {
        return new UserRoleBuilder()
          .withUserUuid(user.uuid)
          .withRoleUuid(role.uuid)
          .build()
      })

      await dataSource.manager.insert(UserRole, userRoles)

      const response = await request(setup.httpServer)
        .delete(`/api/v1/roles/${role.uuid}`)
        .set('Authorization', `Bearer ${userWithPermission.token}`)

      expect(response).toHaveStatus(204)

      // check if users do not have the role anymore
      const usersAfter = await new UserRepository(dataSource.manager).find({
        where: { uuid: Any(users.map(user => user.uuid)) },
        relations: { userRoles: { role: true } }
      })

      usersAfter.forEach((user) => {
        expect(user.userRoles).toHaveLength(0)
      })
    })

    it('returns 403 when user does not have permission', async () => {
      const role = new RoleBuilder()
        .withName('should-not-delete-role-without-permission')
        .build()

      await dataSource.manager.insert(Role, role)

      const response = await request(setup.httpServer)
        .delete(`/api/v1/roles/${role.uuid}`)
        .set('Authorization', `Bearer ${userWithoutPermission.token}`)

      expect(response).toHaveStatus(403)
    })
  })
})
