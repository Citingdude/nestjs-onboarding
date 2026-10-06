import { after, before, describe, it } from 'node:test'
import { randomUUID } from 'crypto'
import request from 'supertest'
import { expect } from 'expect'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('View user detail e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()

    const [authorizedUser, unauthorizedUser] = await Promise.all([
      setup.authContext.getUser([Permission.USER_READ]),
      setup.authContext.getUser([Permission.USER_CREATE])
    ])

    userWithPermission = authorizedUser
    userWithoutPermission = unauthorizedUser
  })

  after(async () => await setup.teardown())

  it('returns 404 when the user does not exist', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/users/${randomUUID()}`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(404)
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/users/${userWithPermission.user.uuid}`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })

  it('returns user details when having USER_READ permission', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/users/${userWithoutPermission.user.uuid}`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(200)
  })
})
