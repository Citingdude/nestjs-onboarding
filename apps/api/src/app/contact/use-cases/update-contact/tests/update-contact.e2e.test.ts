import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { UpdateContactCommandBuilder } from '#src/app/contact/use-cases/update-contact/update-contact.command.builder.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('update contact e2e tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.CONTACT_UPDATE])
  })

  after(async () => {
    await setup.teardown()
  })

  it('updates a contact successfully', async () => {
    const contact = new ContactBuilder().build()
    await setup.entityManager.insert(Contact, contact)

    const command = new UpdateContactCommandBuilder()
      .withFirstName('updated name')
      .build()

    const response = await request(setup.httpServer)
      .put(`/api/v1/contacts/${contact.uuid}`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(204)
  })

  it('returns 403 when user does not have permission', async () => {
    const userWithoutPermission = await setup.authContext.getUser([Permission.CONTACT_READ])
    const contact = new ContactBuilder().build()
    await setup.entityManager.insert(Contact, contact)

    const command = new UpdateContactCommandBuilder()
      .withFirstName('another update')
      .build()

    const response = await request(setup.httpServer)
      .put(`/api/v1/contacts/${contact.uuid}`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
