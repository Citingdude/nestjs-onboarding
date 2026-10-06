import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { stringify } from 'qs'
import { HttpStatus } from '@nestjs/common'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import type { SearchCollectionsQueryKey } from '#src/modules/global-search/search-collections/query/search-collections.query-key.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { SearchCollectionsFlag } from '#src/modules/global-search/search-collections/search-collections.flag.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { SearchCollectionsQueryBuilder } from '#src/modules/global-search/search-collections/query/search-collections.query-builder.js'
import type { User } from '#src/modules/auth/users/entities/user.entity.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'

describe('Search collections e2e test', () => {
  let setup: TestSetup
  let user: TestUser
  let typesense: TypesenseClient
  let user1: User
  let user2: User

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([Permission.USER_READ])
    typesense = setup.testModule.get(TypesenseClient, { strict: false })
    await typesense.truncateCollection(TypesenseCollectionName.USER)
    await typesense.truncateCollection(TypesenseCollectionName.CONTACT)

    user1 = new UserBuilder()
      .withFirstName('Test')
      .withLastName('1')
      .build()

    user2 = new UserBuilder()
      .withFirstName('Frank')
      .withLastName('De Tester')
      .build()

    const user3 = new UserBuilder()
      .withFirstName('User')
      .withLastName('3')
      .build()

    await typesense.importManually(
      TypesenseCollectionName.USER,
      [user1, user2, user3]
    )
  })

  after(async () => {
    await setup.teardown()
  })

  it('throws 404 when feature flag is disabled', async () => {
    setup.flags.mockFlag(SearchCollectionsFlag, false)

    const query = new SearchCollectionsQueryBuilder()
      .withSearch('Test')
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${user.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(404)
  })

  it('returns search results that match the permissions', async () => {
    const user = await setup.authContext.getUser([Permission.CONTACT_READ])

    const contact = new ContactBuilder()
      .withFirstName('Test')
      .withLastName('Contact')
      .build()

    await typesense.importManually(
      TypesenseCollectionName.CONTACT,
      [contact]
    )

    const query = new SearchCollectionsQueryBuilder()
      .withSearch('Test')
      .withFilterOn([
        TypesenseCollectionName.USER,
        TypesenseCollectionName.CONTACT
      ])
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${user.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(HttpStatus.OK)
    expect(response.body.items).toHaveLength(1)
    expect(response.body.items[0].collection).toEqual(TypesenseCollectionName.CONTACT)
    expect(response.body.items[0].entity.uuid).toEqual(contact.uuid)
  })

  it('returns the searched collection ordered on text score', async () => {
    const query = new SearchCollectionsQueryBuilder()
      .withSearch('Test')
      .withFilterOn([
        TypesenseCollectionName.USER
      ])
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${user.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.items[0].entity.uuid).toEqual(user1.uuid)
    expect(response.body.items[0].collection).toEqual(TypesenseCollectionName.USER)
    expect(response.body.items[1].entity.uuid).toEqual(user2.uuid)
    expect(response.body.items[1].collection).toEqual(TypesenseCollectionName.USER)
  })

  it('returns search results of all collections when not filtered', async () => {
    const query = new SearchCollectionsQueryBuilder()
      .withSearch('Test')
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${user.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.items[0].entity.uuid).toEqual(user1.uuid)
    expect(response.body.items[0].collection).toEqual(TypesenseCollectionName.USER)
    expect(response.body.items[1].entity.uuid).toEqual(user2.uuid)
    expect(response.body.items[1].collection).toEqual(TypesenseCollectionName.USER)
  })

  it('returns the next set of results when using the next key', async () => {
    const query = new SearchCollectionsQueryBuilder()
      .withSearch('Test')
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${user.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.meta.next).not.toBe(null)

    const followUpQuery = new SearchCollectionsQueryBuilder()
      .withSearch('Test')
      .withKey(response.body.meta.next as SearchCollectionsQueryKey)
      .build()

    const followUpResponse = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${user.token}`)
      .query(stringify(followUpQuery))

    expect(followUpResponse).toHaveStatus(200)
    expect(followUpResponse.body.items).toHaveLength(0)
    expect(followUpResponse.body.meta.next).toBe(null)
  })

  it('respects maxResultsPerCollection parameter to limit results per collection', async () => {
    const query = new SearchCollectionsQueryBuilder()
      .withSearch('Test')
      .withMaxResultsPerCollection(1)
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${user.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(1)
    expect(response.body.items[0].entity.uuid).toEqual(user1.uuid)
    expect(response.body.items[0].collection).toEqual(TypesenseCollectionName.USER)
    expect(response.body.meta.next).not.toBe(null)

    const nextQuery = new SearchCollectionsQueryBuilder()
      .withSearch('Test')
      .withMaxResultsPerCollection(1)
      .withKey(response.body.meta.next as SearchCollectionsQueryKey)
      .build()

    const nextResponse = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${user.token}`)
      .query(stringify(nextQuery))

    expect(nextResponse).toHaveStatus(200)
    expect(nextResponse.body.items).toHaveLength(1)
    expect(nextResponse.body.items[0].entity.uuid).toEqual(user2.uuid)
    expect(nextResponse.body.items[0].collection).toEqual(TypesenseCollectionName.USER)
    expect(nextResponse.body.meta.next).not.toBe(null)
  })
})
