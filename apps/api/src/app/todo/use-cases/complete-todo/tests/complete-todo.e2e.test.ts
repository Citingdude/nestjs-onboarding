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
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'

describe('Complete todo e2e tests', () => {
  let setup: TestSetup
  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([Permission.TODO_UPDATE])
  })

  after(async () => {
    await setup.teardown()
  })

  it('when the todo exists, completes only that todo and preserves its other fields', async () => {
    const todo = new TodoBuilder()
      .withUserUuid(user.user.uuid)
      .withDescription('Keep this description')
      .withDeadline(new Date())
      .build()
    const otherTodo = new TodoBuilder().withUserUuid(user.user.uuid).build()
    await setup.entityManager.insert(Todo, [todo, otherTodo])

    const response = await request(setup.httpServer)
      .patch(`/api/v1/todos/${todo.uuid}/complete`)
      .set('Authorization', `Bearer ${user.token}`)

    expect(response).toHaveStatus(204)
    expect(response.text).toBe('')
    const completed = await setup.entityManager.findOneByOrFail(Todo, { uuid: todo.uuid })
    expect(completed).toMatchObject({ ...todo, completed: true, updatedAt: expect.any(Date) })
    const unchanged = await setup.entityManager.findOneByOrFail(Todo, { uuid: otherTodo.uuid })
    expect(unchanged.completed).toBe(false)

    const repeatedResponse = await request(setup.httpServer)
      .patch(`/api/v1/todos/${todo.uuid}/complete`)
      .set('Authorization', `Bearer ${user.token}`)

    expect(repeatedResponse).toHaveStatus(204)
    const repeated = await setup.entityManager.findOneByOrFail(Todo, { uuid: todo.uuid })
    expect(repeated.updatedAt).toEqual(completed.updatedAt)
  })

  it('when the todo does not exist, returns 404', async () => {
    const uuid = generateUuid<TodoUuid>()
    const response = await request(setup.httpServer)
      .patch(`/api/v1/todos/${uuid}/complete`)
      .set('Authorization', `Bearer ${user.token}`)

    expect(response).toHaveStatus(404)
    expect(response).toHaveApiError(new TodoNotFoundError(uuid))
  })

  it('when unauthenticated, returns 401', async () => {
    const response = await request(setup.httpServer)
      .patch(`/api/v1/todos/${generateUuid<TodoUuid>()}/complete`)

    expect(response).toHaveStatus(401)
  })

  it('when the user lacks update permission, returns 403 and preserves the todo', async () => {
    const unauthorizedUser = await setup.authContext.getUser([Permission.TODO_READ])
    const todo = new TodoBuilder().withUserUuid(unauthorizedUser.user.uuid).build()
    await setup.entityManager.insert(Todo, todo)

    const response = await request(setup.httpServer)
      .patch(`/api/v1/todos/${todo.uuid}/complete`)
      .set('Authorization', `Bearer ${unauthorizedUser.token}`)

    expect(response).toHaveStatus(403)
    const unchanged = await setup.entityManager.findOneByOrFail(Todo, { uuid: todo.uuid })
    expect(unchanged.completed).toBe(false)
  })
})
