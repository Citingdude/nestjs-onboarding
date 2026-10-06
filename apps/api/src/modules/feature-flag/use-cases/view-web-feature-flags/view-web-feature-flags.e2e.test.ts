import { after, before, describe, it } from 'node:test'
import { expect } from 'expect'
import request from 'supertest'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { WebChangeAppearanceFlag } from '#src/modules/feature-flag/web-flags/web-change-appearance.flag.js'
import { WebCommandMenuFlag } from '#src/modules/feature-flag/web-flags/web-command-menu.flag.js'

describe('View web feature flags e2e', () => {
  let setup: TestSetup
  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([])
  })

  after(async () => await setup.teardown())

  it('returns the web feature flags for the authenticated user', async () => {
    setup.flags.mockFlag(WebChangeAppearanceFlag, false)
    setup.flags.mockFlag(WebCommandMenuFlag, true)

    const response = await request(setup.httpServer)
      .get('/api/v1/me/feature-flags')
      .set('Authorization', `Bearer ${user.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body).toEqual({
      changeAppearance: false,
      commandMenu: true
    })
  })
})
