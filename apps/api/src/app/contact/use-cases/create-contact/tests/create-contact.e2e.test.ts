import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { CreateContactCommandBuilder } from '#src/app/contact/use-cases/create-contact/create-contact.command.builder.js'

describe('Create contact e2e tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.CONTACT_CREATE])
  })

  after(async () => {
    await setup.teardown()
  })

  it('Creates a new contact successfully', async () => {
    const command = new CreateContactCommandBuilder().build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/contacts`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(201)
    expect(response.body).toStrictEqual(expect.objectContaining({
      uuid: expect.uuid()
    }))
  })

  it('returns 403 when user does not have permission', async () => {
    const userWithoutPermission = await setup.authContext.getUser([Permission.CONTACT_READ])
    const command = new CreateContactCommandBuilder().build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/contacts`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
