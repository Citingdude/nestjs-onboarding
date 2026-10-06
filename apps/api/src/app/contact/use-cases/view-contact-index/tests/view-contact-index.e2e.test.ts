import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { stringify } from 'qs'
import { expect } from 'expect'
import { SortDirection } from '@wisemen/pagination'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import { ViewContactIndexQueryBuilder } from '#src/app/contact/use-cases/view-contact-index/query/view-contact-index.query.builder.js'
import type { Contact } from '#src/app/contact/entities/contact.entity.js'
import { ViewContactIndexSortQueryKey } from '#src/app/contact/use-cases/view-contact-index/query/view-contact-index-sort.query.js'
import { MigrateCollectionsUseCase } from '#src/modules/typesense/use-cases/migrate-collections/migrate-collections.use-case.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('View contact index e2e tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let findableContact: Contact
  let unfindableByNameContact: Contact
  let unfindableByIsActiveContact: Contact

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.CONTACT_READ])

    const typesenseMigrator = setup.testModule.get(MigrateCollectionsUseCase, { strict: false })
    await typesenseMigrator.execute(true, [TypesenseCollectionName.CONTACT])

    const client = setup.testModule.get(TypesenseClient, { strict: false })

    findableContact = new ContactBuilder()
      .withFirstName('Jonas')
      .build()
    unfindableByNameContact = new ContactBuilder()
      .withFirstName('AAA')
      .build()
    unfindableByIsActiveContact = new ContactBuilder()
      .withFirstName('BBB')
      .withIsActive(false)
      .build()

    await client.importManually(
      TypesenseCollectionName.CONTACT,
      [
        findableContact,
        unfindableByNameContact,
        unfindableByIsActiveContact
      ]
    )
  })

  after(async () => {
    await setup.teardown()
  })

  it('Retrieves contacts successfully when searched', async () => {
    const query = new ViewContactIndexQueryBuilder()
      .withSearch('Jonas')
      .withFilter({
        isActive: 'true'
      })
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/contacts`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body).toStrictEqual(expect.objectContaining({
      items: [expect.objectContaining({ uuid: findableContact.uuid })],
      meta: expect.objectContaining({ total: 1, limit: 10, offset: 0 })
    }))
  })

  it('Retrieves contacts successfully when sorted', async () => {
    const query = new ViewContactIndexQueryBuilder()
      .withSortOn(ViewContactIndexSortQueryKey.NAME, SortDirection.ASC)
      .build()

    const response = await request(setup.httpServer)
      .get(`/api/v1/contacts`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(3)
    expect(response.body.items[0].uuid).toEqual(unfindableByNameContact.uuid)
    expect(response.body.items[1].uuid).toEqual(unfindableByIsActiveContact.uuid)
    expect(response.body.items[2].uuid).toEqual(findableContact.uuid)
  })

  it('returns 403 when user does not have permission', async () => {
    const userWithoutPermission = await setup.authContext.getUser([Permission.CONTACT_CREATE])
    const response = await request(setup.httpServer)
      .get(`/api/v1/contacts`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
