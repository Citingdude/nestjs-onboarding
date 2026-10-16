import { after, before, describe, it } from 'node:test'
import { expect } from 'expect'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { TodoTypesenseCollector } from '#src/app/todo/typesense/todo.typesense-collector.js'
import { MigrateCollectionsUseCase } from '#src/modules/typesense/use-cases/migrate-collections/migrate-collections.use-case.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { TodoBuilder } from '#src/app/todo/entities/todo.entity.builder.js'
import { TodoCollection } from '#src/app/todo/typesense/todo.typesense-collection.js'

describe('Todo typesense', () => {
  let setup: TestSetup
  let collector: TodoTypesenseCollector

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    collector = setup.app.get(TodoTypesenseCollector)
  })

  after(async () => await setup.teardown())

  it('migrates the todo collection', async () => {
    const migrator = setup.app.get(MigrateCollectionsUseCase, { strict: false })
    const promise = migrator.execute(true, [TypesenseCollectionName.TODO])
    await expect(promise).resolves.not.toThrow()
  })

  it('imports todos manually to typesense', async () => {
    const todo1 = new TodoBuilder().build()
    const todo2 = new TodoBuilder().build()
    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.importManually(
      TypesenseCollectionName.TODO, [todo1, todo2]
    )
    await expect(promise).resolves.not.toThrow()
  })

  it('imports changed todos to typesense', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    new TodoBuilder().build()
    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.importChanged(TypesenseCollectionName.TODO, yesterday)
    await expect(promise).resolves.not.toThrow()
  })

  it('deletes removed todos from typesense', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.deleteRemoved(TypesenseCollectionName.TODO, yesterday)
    await expect(promise).resolves.not.toThrow()
  })

  it('truncates the todo collection', async () => {
    const todo = new TodoBuilder().build()
    const client = setup.app.get(TypesenseClient, { strict: false })
    await client.importManually(TypesenseCollectionName.TODO, [todo])
    const promise = client.truncateCollection(TypesenseCollectionName.TODO)
    await expect(promise).resolves.not.toThrow()
  })

  it('adds documents', async () => {
    const todo = new TodoBuilder().build()
    const typesenseTodo = collector.transform([todo])

    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.addDocuments(TodoCollection, typesenseTodo)

    await expect(promise).resolves.not.toThrow()
  })

  it('searches todos', async () => {
    const todo = new TodoBuilder().withTitle('Test').build()

    const client = setup.app.get(TypesenseClient, { strict: false })
    await client.importManually(TypesenseCollectionName.TODO, [todo])

    const searchParams = {
      q: 'Test',
      query_by: 'title',
      per_page: 1
    }

    const result = await client.search(TodoCollection, searchParams)

    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe(todo.uuid)
  })

  it('multi-searches todos', async () => {
    const todo = new TodoBuilder().withTitle('Test').build()

    const client = setup.app.get(TypesenseClient, { strict: false })
    await client.importManually(TypesenseCollectionName.TODO, [todo])

    const multisearchSchemas = [
      {
        collection: TypesenseCollectionName.TODO,
        q: 'Test',
        query_by: 'title',
        per_page: 1
      }
    ]

    const result = await client.multiSearch(multisearchSchemas, {})

    expect(result).toBeDefined()
    expect(result.todo).toHaveLength(1)
  })
})
