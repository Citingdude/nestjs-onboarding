import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { CreateTodoCommandBuilder } from '#src/app/todo/use-cases/tests/create-todo.command.builder.js'

describe('Create todo', () => {
  let setup: TestSetup
  let user: TestUser
  let unauthorizedUser: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([Permission.TODO_CREATE])
    unauthorizedUser = await setup.authContext.getUser([])
  })

  after(async () => {
    await setup.teardown()
  })

  it('blocks calls without authentication', async () => {
    const response = await request(setup.app.getHttpServer())
      .post('/api/v1/todos')

    expect(response).toHaveStatus(401)
  })

  it('blocks unauthorized users', async () => {
    const response = await request(setup.app.getHttpServer())
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${unauthorizedUser.token}`)
      .send({})

    expect(response).toHaveStatus(403)
  })

  it('validates the command', async () => {
    const response = await request(setup.app.getHttpServer())
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user.token}`)
      .send({})

    expect(response).toHaveStatus(400)
  })

  it('creates a todo', async () => {
    const command = new CreateTodoCommandBuilder()
      .withTitle('Test Todo')
      .withDescription('Test Description')
      .withDeadline(new Date())
      .build()

    const response = await request(setup.app.getHttpServer())
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user.token}`)
      .send(command)

    expect(response).toHaveStatus(201)
    expect(response.body).toStrictEqual(expect.objectContaining({
      uuid: expect.uuid()
    }))
  })
})
