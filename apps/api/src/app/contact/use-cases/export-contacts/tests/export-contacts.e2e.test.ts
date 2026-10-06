import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Export contacts e2e test', () => {
  let setup: TestSetup
  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([Permission.CONTACT_EXPORT])
  })

  after(async () => {
    await setup.teardown()
  })

  it('successfully schedules a contact CSV export job', async () => {
    const response = await request(setup.httpServer)
      .post('/api/v1/contacts/export')
      .set('Authorization', `Bearer ${user.token}`)
      .send()

    expect(response).toHaveStatus(201)
    expect(response.body).toStrictEqual({ exportUuid: expect.uuid() })
  })

  it('returns 403 when user lacks CONTACT_EXPORT permission', async () => {
    const unauthorizedUser = await setup.authContext.getUser([])

    const response = await request(setup.httpServer)
      .post('/api/v1/contacts/export')
      .set('Authorization', `Bearer ${unauthorizedUser.token}`)
      .send()

    expect(response).toHaveStatus(403)
  })
})
