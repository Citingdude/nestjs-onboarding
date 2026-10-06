import { after, before, describe, it } from 'node:test'
import { expect } from 'expect'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { MigrateCollectionsUseCase } from '#src/modules/typesense/use-cases/migrate-collections/migrate-collections.use-case.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { UserCollection } from '#src/modules/auth/users/typesense/user.typesense-collection.js'

describe('User typesense', () => {
  let setup: TestSetup

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
  })

  after(async () => await setup.teardown())

  it('migrates the user collection', async () => {
    const migrator = setup.app.get(MigrateCollectionsUseCase, { strict: false })
    const promise = migrator.execute(true, [TypesenseCollectionName.USER])
    await expect(promise).resolves.not.toThrow()
  })

  it('imports an user to typesense', async () => {
    const user = new UserBuilder().build()

    await setup.entityManager.insert(User, user)

    const client = setup.app.get(TypesenseClient, { strict: false })
    const collectionName = TypesenseCollectionName.USER
    const promise = client.import(collectionName, [user.uuid])

    await expect(promise).resolves.not.toThrow()
  })

  it('imports users manually to typesense', async () => {
    const user1 = new UserBuilder().build()
    const user2 = new UserBuilder().build()

    await setup.entityManager.insert(User, [user1, user2])

    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.importManually(TypesenseCollectionName.USER, [user1, user2])

    await expect(promise).resolves.not.toThrow()
  })

  it('imports changed users to typesense', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const user = new UserBuilder().build()

    await setup.entityManager.insert(User, user)

    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.importChanged(TypesenseCollectionName.USER, yesterday)

    await expect(promise).resolves.not.toThrow()
  })

  it('deletes removed users from typesense', async () => {
    const user = new UserBuilder().build()

    await setup.entityManager.insert(User, user)

    const client = setup.app.get(TypesenseClient, { strict: false })
    await client.importManually(TypesenseCollectionName.USER, [user])

    await setup.entityManager.softRemove(user)

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const promise = client.deleteRemoved(TypesenseCollectionName.USER, yesterday)

    await expect(promise).resolves.not.toThrow()
  })

  it('truncates the user collection', async () => {
    const user = new UserBuilder().build()

    await setup.entityManager.insert(User, user)

    const client = setup.app.get(TypesenseClient, { strict: false })
    await client.importManually(TypesenseCollectionName.USER, [user])

    const promise = client.truncateCollection(TypesenseCollectionName.USER)

    await expect(promise).resolves.not.toThrow()
  })

  it('adds documents using TypesenseClient', async () => {
    const user = new UserBuilder().build()

    await setup.entityManager.insert(User, user)

    const client = setup.app.get(TypesenseClient, { strict: false })
    const addPromise = client.addDocuments(UserCollection, [{
      id: user.uuid,
      email: user.email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined
    }])
    await expect(addPromise).resolves.not.toThrow()
  })

  it('truncates user collection using TypesenseClient', async () => {
    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.truncateCollection(UserCollection)

    await expect(promise).resolves.not.toThrow()
  })

  it('searches users using TypesenseClient', async () => {
    const user = new UserBuilder().build()

    await setup.entityManager.insert(User, user)

    const client = setup.app.get(TypesenseClient, { strict: false })
    const collectionName = TypesenseCollectionName.USER
    await client.import(collectionName, [user.uuid])

    const searchParams = {
      q: user.email,
      query_by: 'email',
      per_page: 1
    }

    const result = await client.search(UserCollection, searchParams)

    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe(user.uuid)
  })

  it('multi-searches users using TypesenseClient', async () => {
    const user = new UserBuilder().build()

    await setup.entityManager.insert(User, user)

    const client = setup.app.get(TypesenseClient, { strict: false })
    const collectionName = TypesenseCollectionName.USER
    await client.import(collectionName, [user.uuid])

    const multiSearchSchemas = [
      {
        collection: TypesenseCollectionName.USER,
        q: user.email,
        query_by: 'email',
        per_page: 1
      }
    ]
    const result = await client.multiSearch(multiSearchSchemas, {})

    expect(result).toBeDefined()
    expect(result.user).toHaveLength(1)
  })
})
