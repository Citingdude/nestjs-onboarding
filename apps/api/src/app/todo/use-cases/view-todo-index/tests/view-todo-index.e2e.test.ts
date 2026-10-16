import { after, before, describe, it } from 'node:test'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import request from 'supertest'
import { stringify } from 'qs'
import { expect } from 'expect'
import { SortDirection } from '@wisemen/pagination'
import type { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { MigrateCollectionsUseCase } from '#src/modules/typesense/use-cases/migrate-collections/migrate-collections.use-case.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { TodoBuilder } from '#src/app/todo/entities/todo.entity.builder.js'
import { ViewTodoIndexQueryBuilder } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index.query.builder.js'
import { ViewTodoIndexSortQueryKey } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index-sort.query.js'

describe('View todo index e2e tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let findableTodo: Todo
  let unfindableByTitleTodo: Todo
  let unfindableByCompletedTodo: Todo

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.TODO_READ])

    const typesenseMigrator = setup.testModule.get(MigrateCollectionsUseCase, { strict: false })
    await typesenseMigrator.execute(true, [TypesenseCollectionName.TODO])

    const client = setup.testModule.get(TypesenseClient, { strict: false })

    findableTodo = new TodoBuilder()
      .withTitle('Test')
      .build()
    unfindableByTitleTodo = new TodoBuilder()
      .withTitle('AAA')
      .build()
    unfindableByCompletedTodo = new TodoBuilder()
      .withTitle('BBB')
      .withCompleted(true)
      .build()

    await client.importManually(
      TypesenseCollectionName.TODO,
      [
        findableTodo,
        unfindableByCompletedTodo,
        unfindableByTitleTodo
      ]
    )
  })

  after(async () => {
    await setup.teardown()
  })

  it('Retrieves todos successfully when searched', async () => {
    const query = new ViewTodoIndexQueryBuilder()
      .withSearch('Test')
      .withFilter({
        completed: 'false'
      })
      .build()

    const response = await request(setup.httpServer)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body).toStrictEqual(expect.objectContaining({
      items: [expect.objectContaining({ uuid: findableTodo.uuid })],
      meta: expect.objectContaining({ total: 1, limit: 10, offset: 0 })
    }))
  })

  it('Retrieves contacts succesfully when sorted', async () => {
    const query = new ViewTodoIndexQueryBuilder()
      .withSortOn(ViewTodoIndexSortQueryKey.TITLE, SortDirection.ASC)
      .build()

    const response = await request(setup.httpServer)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(3)
    expect(response.body.items[0].uuid).toEqual(unfindableByTitleTodo.uuid)
    expect(response.body.items[1].uuid).toEqual(unfindableByCompletedTodo.uuid)
    expect(response.body.items[2].uuid).toEqual(findableTodo.uuid)
  })

  it('returns 403 when user does not have permission', async () => {
    const userWithoutPermission = await setup.authContext.getUser([])
    const response = await request(setup.httpServer)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
