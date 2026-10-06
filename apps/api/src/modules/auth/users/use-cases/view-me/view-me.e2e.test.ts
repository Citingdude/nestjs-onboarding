import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('View me e2e test', () => {
  let setup: TestSetup
  let authorizedUser: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()

    const user = await setup.authContext.getUser([Permission.USER_READ])

    authorizedUser = user
  })

  after(async () => await setup.teardown())

  it('returns user data about themselves', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/users/me`)
      .set('Authorization', `Bearer ${authorizedUser.token}`)

    expect(response).toHaveStatus(200)
  })
})
