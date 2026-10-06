import { after, before, describe, it } from 'node:test'
import { expect } from 'expect'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { MigrateCollectionsUseCase } from '#src/modules/typesense/use-cases/migrate-collections/migrate-collections.use-case.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import { ContactTypesenseCollector } from '#src/app/contact/typesense/contact.typesense-collector.js'
import { ContactCollection } from '#src/app/contact/typesense/contact.typesense-collection.js'

describe('Contact typesense', () => {
  let setup: TestSetup
  let collector: ContactTypesenseCollector

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    collector = setup.app.get(ContactTypesenseCollector, { strict: false })
  })

  after(async () => await setup.teardown())

  it('migrates the contact collection', async () => {
    const migrator = setup.app.get(MigrateCollectionsUseCase, { strict: false })
    const promise = migrator.execute(true, [TypesenseCollectionName.CONTACT])
    await expect(promise).resolves.not.toThrow()
  })

  it('imports a contact to typesense', async () => {
    const contact = new ContactBuilder().build()
    const importer = setup.app.get(TypesenseClient, { strict: false })
    const collectionName = TypesenseCollectionName.CONTACT
    const promise = importer.import(collectionName, [contact.uuid])
    await expect(promise).resolves.not.toThrow()
  })

  it('imports contacts manually to typesense', async () => {
    const contact1 = new ContactBuilder().build()
    const contact2 = new ContactBuilder().build()
    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.importManually(
      TypesenseCollectionName.CONTACT, [contact1, contact2]
    )
    await expect(promise).resolves.not.toThrow()
  })

  it('imports changed contacts to typesense', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    new ContactBuilder().build()
    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.importChanged(TypesenseCollectionName.CONTACT, yesterday)
    await expect(promise).resolves.not.toThrow()
  })

  it('deletes removed contacts from typesense', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.deleteRemoved(TypesenseCollectionName.CONTACT, yesterday)
    await expect(promise).resolves.not.toThrow()
  })

  it('truncates the contact collection', async () => {
    const contact = new ContactBuilder().build()
    const client = setup.app.get(TypesenseClient, { strict: false })
    await client.importManually(TypesenseCollectionName.CONTACT, [contact])
    const promise = client.truncateCollection(TypesenseCollectionName.CONTACT)
    await expect(promise).resolves.not.toThrow()
  })

  it('adds documents', async () => {
    const contact = new ContactBuilder().build()
    const typesenseContact = collector.transform([contact])

    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.addDocuments(ContactCollection, typesenseContact)

    await expect(promise).resolves.not.toThrow()
  })

  it('truncates contact collection', async () => {
    const client = setup.app.get(TypesenseClient, { strict: false })
    const promise = client.truncateCollection(TypesenseCollectionName.CONTACT)
    await expect(promise).resolves.not.toThrow()
  })

  it('searches contacts', async () => {
    const contact = new ContactBuilder().withFirstName('Test').build()

    const client = setup.app.get(TypesenseClient, { strict: false })
    await client.importManually(TypesenseCollectionName.CONTACT, [contact])

    const searchParams = {
      q: 'Test',
      query_by: 'name',
      per_page: 1
    }

    const result = await client.search(ContactCollection, searchParams)

    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe(contact.uuid)
  })

  it('multi-searches contacts', async () => {
    const contact = new ContactBuilder().withFirstName('Test').build()

    const client = setup.app.get(TypesenseClient, { strict: false })
    await client.importManually(TypesenseCollectionName.CONTACT, [contact])

    const multiSearchSchemas = [
      {
        collection: TypesenseCollectionName.CONTACT as TypesenseCollectionName.CONTACT,
        q: 'Test',
        query_by: 'name',
        per_page: 1
      }
    ]
    const result = await client.multiSearch(multiSearchSchemas, {})

    expect(result).toBeDefined()
    expect(result.contact).toHaveLength(1)
  })
})
