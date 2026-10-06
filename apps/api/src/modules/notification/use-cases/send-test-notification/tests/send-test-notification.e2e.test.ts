import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { SendTestNotificationCommand } from '#src/modules/notification/use-cases/send-test-notification/send-test-notification.command.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Send test notification e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.NOTIFICATION_SEND_TEST])
    userWithoutPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_OWN])
  })

  after(async () => {
    await setup.teardown()
  })

  it('sends a test notification', async () => {
    const command: SendTestNotificationCommand = {
      message: 'test'
    }

    const response = await request(setup.httpServer)
      .post(`/api/v1/notifications/test-notification`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(204)
  })

  it('returns 403 when user does not have permission', async () => {
    const command: SendTestNotificationCommand = {
      message: 'test'
    }

    const response = await request(setup.httpServer)
      .post(`/api/v1/notifications/test-notification`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
