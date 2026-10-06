import { before, describe, it, after } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'

describe('View role end to end test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser
  let role: Role

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.ROLE_READ])
    userWithoutPermission = await setup.authContext.getUser([Permission.ROLE_CREATE])

    role = new RoleBuilder()
      .withName('should-update-role')
      .build()
    await setup.entityManager.insert(Role, role)
  })

  after(async () => await setup.teardown())

  describe('Get role', () => {
    it('should return role when having ROLE_READ permission', async () => {
      const response = await request(setup.httpServer)
        .get(`/api/v1/roles/${role.uuid}`)
        .set('Authorization', `Bearer ${userWithPermission.token}`)

      expect(response).toHaveStatus(200)
    })

    it('returns 403 when user does not have permission', async () => {
      const response = await request(setup.httpServer)
        .get(`/api/v1/roles/${role.uuid}`)
        .set('Authorization', `Bearer ${userWithoutPermission.token}`)

      expect(response).toHaveStatus(403)
    })
  })
})
