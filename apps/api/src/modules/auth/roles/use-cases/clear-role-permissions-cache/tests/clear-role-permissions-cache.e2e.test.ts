import { before, describe, it, after } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Clear role permissions cache end to end tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.ROLE_CACHE_CLEAR])
    userWithoutPermission = await setup.authContext.getUser([Permission.ROLE_READ])
  })

  after(async () => await setup.teardown())

  it('clears the role cache', async () => {
    const response = await request(setup.httpServer)
      .post(`/api/v1/roles/clear-cache`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send({})

    expect(response).toHaveStatus(204)
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .post(`/api/v1/roles/clear-cache`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send({})

    expect(response).toHaveStatus(403)
  })
})
