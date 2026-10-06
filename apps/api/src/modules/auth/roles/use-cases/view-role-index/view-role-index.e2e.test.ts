import { before, describe, it, after } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('View roles end to end tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.ROLE_READ])
    userWithoutPermission = await setup.authContext.getUser([Permission.ROLE_CREATE])
  })

  after(async () => await setup.teardown())

  describe('Get roles', () => {
    it('should return roles when having ROLE_READ permission', async () => {
      const response = await request(setup.httpServer)
        .get(`/api/v1/roles`)
        .set('Authorization', `Bearer ${userWithPermission.token}`)

      expect(response).toHaveStatus(200)
    })

    it('returns 403 when user does not have permission', async () => {
      const response = await request(setup.httpServer)
        .get(`/api/v1/roles`)
        .set('Authorization', `Bearer ${userWithoutPermission.token}`)

      expect(response).toHaveStatus(403)
    })
  })
})
