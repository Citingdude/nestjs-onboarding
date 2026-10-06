import { before, describe, it, after } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { TestAuthContext } from '#src/modules/test-setup/test-auth-context.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { UserRoleBuilder } from '#src/modules/auth/roles/entities/user-role.entity.builder.js'

describe('Set user roles - e2e tests', () => {
  let setup: TestSetup
  let context: TestAuthContext

  let userWithPermission: TestUser
  let userWithoutPermission: TestUser
  let user: TestUser

  let systemRole: Role

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    context = setup.authContext

    userWithPermission = await context.getUser([Permission.USER_UPDATE])
    userWithoutPermission = await context.getUser([Permission.USER_READ])
    user = await context.getDefaultUser()

    systemRole = new RoleBuilder()
      .withName('system-test-role')
      .build()

    const existingRole = new RoleBuilder()
      .withName('existing-test-role')
      .build()

    await setup.entityManager.insert(Role, [systemRole, existingRole])

    const existingUserRole = new UserRoleBuilder()
      .withUserUuid(user.user.uuid)
      .withRoleUuid(existingRole.uuid)
      .build()

    user.user.userRoles = [existingUserRole]

    await setup.entityManager.insert(UserRole, existingUserRole)
  })

  after(async () => {
    await setup.teardown()
  })

  it('returns 401 when not authenticated', async () => {
    const response = await request(setup.httpServer)
      .post(`/api/v1/users/${user.user.uuid}/role`)
      .send({ roleUuids: [systemRole.uuid] })

    expect(response).toHaveStatus(401)
  })

  it('returns 403 when not authorized', async () => {
    const response = await request(setup.httpServer)
      .post(`/api/v1/users/${user.user.uuid}/role`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send({ roleUuids: [systemRole.uuid] })

    expect(response).toHaveStatus(403)
  })

  it('sets roles for a user', async () => {
    const response = await request(setup.httpServer)
      .post(`/api/v1/users/${user.user.uuid}/role`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send({ roleUuids: [systemRole.uuid] })

    expect(response).toHaveStatus(201)
  })
})
