import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Get notification types config e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_CONFIG])
    userWithoutPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_OWN])
  })

  after(async () => {
    await setup.teardown()
  })

  it('returns notification types config', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/notification-preferences/config`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body.groups).toStrictEqual(expect.arrayContaining([
      {
        name: expect.any(String),
        description: expect.any(String),
        types: expect.arrayContaining([{
          key: expect.any(String),
          description: expect.any(String),
          channelConfigs: expect.arrayContaining([{
            channel: expect.isEnumValue(NotificationChannel),
            defaultValue: expect.any(Boolean),
            isSupported: expect.any(Boolean)
          }])
        }])
      }
    ]))
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/notification-preferences/config`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
