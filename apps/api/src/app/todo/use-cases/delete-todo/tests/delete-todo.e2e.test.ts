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

describe('Delete todo e2e tests', () => {
  let setup: TestSetup
  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([Permission.TODO_DELETE])
  })

  after(async () => {
    await setup.teardown()
  })

  it('when the todo exists, deletes only that todo and returns 204', async () => {
    const todo = new TodoBuilder().withUserUuid(user.user.uuid).build()
    const otherTodo = new TodoBuilder().withUserUuid(user.user.uuid).build()
    await setup.entityManager.insert(Todo, [todo, otherTodo])

    const response = await request(setup.httpServer)
      .delete(`/api/v1/todos/${todo.uuid}`)
      .set('Authorization', `Bearer ${user.token}`)

    expect(response).toHaveStatus(204)
    expect(response.text).toBe('')
    expect(await setup.entityManager.existsBy(Todo, { uuid: todo.uuid })).toBe(false)
    expect(await setup.entityManager.existsBy(Todo, { uuid: otherTodo.uuid })).toBe(true)

    const repeatedResponse = await request(setup.httpServer)
      .delete(`/api/v1/todos/${todo.uuid}`)
      .set('Authorization', `Bearer ${user.token}`)

    expect(repeatedResponse).toHaveStatus(404)
    expect(repeatedResponse).toHaveApiError(new TodoNotFoundError(todo.uuid))
  })

  it('when the todo does not exist, returns 404', async () => {
    const uuid = generateUuid<TodoUuid>()
    const response = await request(setup.httpServer)
      .delete(`/api/v1/todos/${uuid}`)
      .set('Authorization', `Bearer ${user.token}`)

    expect(response).toHaveStatus(404)
    expect(response).toHaveApiError(new TodoNotFoundError(uuid))
  })

  it('when unauthenticated, returns 401', async () => {
    const response = await request(setup.httpServer)
      .delete(`/api/v1/todos/${generateUuid<TodoUuid>()}`)

    expect(response).toHaveStatus(401)
  })

  it('when the user lacks delete permission, returns 403 and preserves the todo', async () => {
    const unauthorizedUser = await setup.authContext.getUser([Permission.TODO_READ])
    const todo = new TodoBuilder().withUserUuid(unauthorizedUser.user.uuid).build()
    await setup.entityManager.insert(Todo, todo)

    const response = await request(setup.httpServer)
      .delete(`/api/v1/todos/${todo.uuid}`)
      .set('Authorization', `Bearer ${unauthorizedUser.token}`)

    expect(response).toHaveStatus(403)
    expect(await setup.entityManager.existsBy(Todo, { uuid: todo.uuid })).toBe(true)
  })
})
