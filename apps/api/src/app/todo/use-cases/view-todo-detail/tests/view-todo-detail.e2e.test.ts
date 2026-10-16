import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TodoBuilder } from '#src/app/todo/entities/todo.entity.builder.js'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

describe('view todo detail e2e tests', () => {
  let setup: TestSetup
  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([Permission.TODO_READ])
  })

  after(async () => {
    await setup.teardown()
  })

  it('retrieves the complete todo details', async () => {
    const todo = new TodoBuilder()
      .withUserUuid(user.user.uuid)
      .withTitle('Finish onboarding')
      .withDescription('Build the todo detail endpoint')
      .withDeadline(new Date())
      .withCompleted(true)
      .build()

    await setup.entityManager.insert(Todo, todo)

    const response = await request(setup.httpServer)
      .get(`/api/v1/todos/${todo.uuid}`)
      .set('Authorization', `Bearer ${user.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body).toStrictEqual({
      uuid: todo.uuid,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
      title: todo.title,
      description: todo.description,
      deadline: todo.deadline?.toISOString(),
      completed: true,
      userUuid: user.user.uuid
    })
  })

  it('returns null for an absent description and deadline', async () => {
    const todo = new TodoBuilder().withUserUuid(user.user.uuid).build()
    await setup.entityManager.insert(Todo, todo)

    const response = await request(setup.httpServer)
      .get(`/api/v1/todos/${todo.uuid}`)
      .set('Authorization', `Bearer ${user.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body.description).toBeNull()
    expect(response.body.deadline).toBeNull()
    expect(response.body.completed).toBe(false)
  })

  it('returns 404 when the todo does not exist', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/todos/${generateUuid<TodoUuid>()}`)
      .set('Authorization', `Bearer ${user.token}`)

    expect(response).toHaveStatus(404)
  })

  it('returns 401 without authentication', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/todos/${generateUuid<TodoUuid>()}`)

    expect(response).toHaveStatus(401)
  })

  it('returns 403 when the user does not have read permission', async () => {
    const unauthorizedUser = await setup.authContext.getUser([Permission.TODO_CREATE])
    const todo = new TodoBuilder().withUserUuid(user.user.uuid).build()
    await setup.entityManager.insert(Todo, todo)

    const response = await request(setup.httpServer)
      .get(`/api/v1/todos/${todo.uuid}`)
      .set('Authorization', `Bearer ${unauthorizedUser.token}`)

    expect(response).toHaveStatus(403)
  })
})
