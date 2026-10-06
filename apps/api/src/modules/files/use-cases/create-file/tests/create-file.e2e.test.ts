import { before, describe, it, after } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { CreateFileCommandBuilder } from './create-file.command.builder.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Create file end to end tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()

    userWithPermission = await setup.authContext.getUser([Permission.FILE_CREATE])
    userWithoutPermission = await setup.authContext.getUser([Permission.FILE_READ])
  })

  after(async () => await setup.teardown())

  it('should create file', async () => {
    const command = new CreateFileCommandBuilder().build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/files`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(201)
  })

  it('creates a public file', async () => {
    const command = new CreateFileCommandBuilder()
      .withIsPublic('true')
      .build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/files`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(201)
  })

  it('returns 403 when user does not have permission', async () => {
    const command = new CreateFileCommandBuilder().build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/files`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
