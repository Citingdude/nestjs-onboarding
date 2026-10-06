import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { stringify } from 'qs'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { SearchCollectionsQueryBuilder } from '#src/modules/global-search/search-collections/query/search-collections.query-builder.js'
import { MigrateCollectionsUseCase } from '#src/modules/typesense/use-cases/migrate-collections/migrate-collections.use-case.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'

describe('Search contact collections e2e test', () => {
  let setup: TestSetup
  let typesense: TypesenseClient
  let userWithPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.CONTACT_READ])

    typesense = setup.testModule.get(TypesenseClient, { strict: false })
    const migrator = setup.testModule.get(MigrateCollectionsUseCase, { strict: false })
    await migrator.execute(true, [TypesenseCollectionName.CONTACT])
  })

  after(async () => await setup.teardown())

  it('returns the contact based on name', async () => {
    const contact = new ContactBuilder()
      .withFirstName('Wisemen')
      .build()

    await typesense.importManually(TypesenseCollectionName.CONTACT, [contact])

    const query = new SearchCollectionsQueryBuilder()
      .withSearch('Wisemen')
      .withFilterOn([TypesenseCollectionName.CONTACT])
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(1)
    expect(response.body.items[0].entity.uuid).toEqual(contact.uuid)
  })

  it('filters contact on is active', async () => {
    const migrator = setup.testModule.get(MigrateCollectionsUseCase, { strict: false })
    await migrator.execute(true, [TypesenseCollectionName.CONTACT])

    const contacts = [
      new ContactBuilder()
        .withFirstName('Wisemen')
        .withIsActive(true)
        .build(),
      new ContactBuilder()
        .withFirstName('Wisemen 2')
        .withIsActive(false)
        .build()
    ]

    await typesense.importManually(TypesenseCollectionName.CONTACT, contacts)

    const query = new SearchCollectionsQueryBuilder()
      .withSearch('Wisemen')
      .withFilterOn([TypesenseCollectionName.CONTACT])
      .withContactActive(true)
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/search`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toStrictEqual([
      expect.objectContaining({
        entity: expect.objectContaining({ uuid: contacts[0].uuid })
      })
    ])
  })
})
