import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { generateUuid } from '@wisemen/nestjs-common'
import { UpdateTodoCommandBuilder } from './update-todo.command.builder.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TodoBuilder } from '#src/app/todo/entities/todo.entity.builder.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

describe('Update todo e2e tests', () => {
  let setup: TestSetup
  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([Permission.TODO_UPDATE])
  })

  after(async () => {
    await setup.teardown()
  })

  it('when the todo exists, updates all editable fields and returns 204', async () => {
    const todo = new TodoBuilder().withUserUuid(user.user.uuid).build()
    await setup.entityManager.insert(Todo, todo)
    const deadline = new Date().toISOString()
    const command = new UpdateTodoCommandBuilder()
      .withTitle('Finish onboarding')
      .withDescription('Updated description')
      .withDeadline(deadline)
      .withCompleted(true)
      .build()

    const response = await request(setup.httpServer)
      .put(`/api/v1/todos/${todo.uuid}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send(command)

    expect(response).toHaveStatus(204)
    expect(response.text).toBe('')
    const updated = await setup.entityManager.findOneByOrFail(Todo, { uuid: todo.uuid })
    expect(updated).toMatchObject({
      title: command.title,
      description: command.description,
      deadline: new Date(deadline),
      completed: true,
      userUuid: todo.userUuid,
      createdAt: todo.createdAt
    })
  })

  it('when clearing optional fields, persists nulls and reopens the todo', async () => {
    const todo = new TodoBuilder()
      .withUserUuid(user.user.uuid)
      .withDescription('Before')
      .withDeadline(new Date())
      .withCompleted(true)
      .build()
    await setup.entityManager.insert(Todo, todo)

    const response = await request(setup.httpServer)
      .put(`/api/v1/todos/${todo.uuid}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send(new UpdateTodoCommandBuilder().build())

    expect(response).toHaveStatus(204)
    const updated = await setup.entityManager.findOneByOrFail(Todo, { uuid: todo.uuid })
    expect(updated).toMatchObject({ description: null, deadline: null, completed: false })
  })

  it('when the todo does not exist, returns 404', async () => {
    const uuid = generateUuid<TodoUuid>()
    const response = await request(setup.httpServer)
      .put(`/api/v1/todos/${uuid}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send(new UpdateTodoCommandBuilder().build())

    expect(response).toHaveStatus(404)
    expect(response).toHaveApiError(new TodoNotFoundError(uuid))
  })

  it('when unauthenticated, returns 401', async () => {
    const response = await request(setup.httpServer)
      .put(`/api/v1/todos/${generateUuid<TodoUuid>()}`)
      .send(new UpdateTodoCommandBuilder().build())

    expect(response).toHaveStatus(401)
  })

  it('when the user lacks update permission, returns 403 and preserves the todo', async () => {
    const unauthorizedUser = await setup.authContext.getUser([Permission.TODO_READ])
    const todo = new TodoBuilder().withUserUuid(unauthorizedUser.user.uuid).build()
    await setup.entityManager.insert(Todo, todo)

    const response = await request(setup.httpServer)
      .put(`/api/v1/todos/${todo.uuid}`)
      .set('Authorization', `Bearer ${unauthorizedUser.token}`)
      .send(new UpdateTodoCommandBuilder().withTitle('Forbidden change').build())

    expect(response).toHaveStatus(403)
    const unchanged = await setup.entityManager.findOneByOrFail(Todo, { uuid: todo.uuid })
    expect(unchanged.title).toBe(todo.title)
  })
})
