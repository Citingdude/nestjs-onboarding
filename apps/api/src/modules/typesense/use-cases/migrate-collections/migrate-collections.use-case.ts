import { Injectable } from '@nestjs/common'
import { captureException } from '@wisemen/opentelemetry'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import type { QueryDeepPartialEntity } from 'typeorm'
import type { CollectionAliasSchema } from 'typesense/lib/Typesense/Aliases.js'
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection.js'
import { Typesense, TypesenseClient, TypesenseCollections, TypesenseCollectors } from '@wisemen/nestjs-typesense'
import type { Client } from 'typesense'
import { MigrateCollectionsGroupCalculator } from './migrate-collections-group.calculator.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { TypesenseSync } from '#src/modules/typesense/use-cases/sync-collection/typesense-sync.entity.js'
import { TYPESENSE_BATCH_SIZE, TYPESENSE_HASH_KEY } from '#src/modules/typesense/typesense.constant.js'

interface CollectionMeta {
  name: TypesenseCollectionName
  hash: string
  existingCollection?: CollectionSchema
}

@Injectable()
export class MigrateCollectionsUseCase {
  constructor (
    private typesenseClient: TypesenseClient,
    private collectors: TypesenseCollectors,
    private collections: TypesenseCollections,
    private groupCalculator: MigrateCollectionsGroupCalculator,
    @InjectRepository(TypesenseSync) private syncRepository: TypeOrmRepository<TypesenseSync>
  ) {}

  async execute (fresh: boolean, aliasNames: TypesenseCollectionName[]): Promise<void> {
    const [{ aliases }, collections] = await Promise.all([
      this.client.aliases().retrieve(),
      this.client.collections().retrieve()
    ])

    const collectionsWithMeta = this.buildCollectionsWithMeta(aliasNames, aliases, collections)
    const groups = this.buildGroups(collectionsWithMeta, fresh)

    for (const group of groups) {
      await this.migrateGroup(group)
    }

    await this.deleteUnusedCollectionsAndAliases(aliases, collections)
  }

  private buildCollectionsWithMeta (
    names: TypesenseCollectionName[],
    aliases: CollectionAliasSchema[],
    collections: CollectionSchema[]
  ): CollectionMeta[] {
    return names.map((name) => {
      const alias = aliases.find(a => a.name === name)
      const existingCollection = collections.find(c => c.name === alias?.collection_name)
      const collection = this.collections.get(name)

      return {
        name,
        hash: Typesense.collectionHash(collection),
        existingCollection
      }
    })
  }

  private buildGroups (items: CollectionMeta[], fresh: boolean): CollectionMeta[][] {
    const aliasNames = items.map(i => i.name)
    const groups = this.groupCalculator.calculate(aliasNames, (name) => {
      if (fresh) {
        return true
      }

      const meta = items.find(c => c.name === name)

      if (meta === undefined) {
        return false
      }

      if (meta.existingCollection === undefined) {
        return true
      }

      return this.getCollectionHash(meta.existingCollection.metadata) !== meta.hash
    })

    return groups.map(groupNames =>
      groupNames.map(name => items.find(i => i.name === name)!)
    )
  }

  private async migrateGroup (items: CollectionMeta[]): Promise<void> {
    const newCollectionNames: string[] = []
    const syncDates: Date[] = []

    for (const item of items) {
      const collection = this.collections.get(item.name)
      const schema = Typesense.collectionSchema(collection)
      const newCollectionName = `${schema.name}_${new Date().toISOString()}`

      schema.name = newCollectionName
      schema.metadata = {
        ...schema.metadata,
        [TYPESENSE_HASH_KEY]: Typesense.collectionHash(collection)
      }

      await this.client.collections().create(schema)
      await this.importDocuments(item.name, newCollectionName)

      newCollectionNames.push(newCollectionName)
      syncDates.push(new Date())
    }

    for (const [index, item] of items.entries()) {
      await this.client.aliases().upsert(item.name, { collection_name: newCollectionNames[index] })
    }

    await this.registerSynced(items.map(i => i.name), syncDates)

    for (const item of items) {
      if (item.existingCollection !== undefined) {
        await this.client.collections(item.existingCollection.name).delete()
      }
    }
  }

  private getCollectionHash (metadata: object | undefined): unknown {
    if (metadata === undefined || !(TYPESENSE_HASH_KEY in metadata)) {
      return undefined
    }

    return metadata[TYPESENSE_HASH_KEY]
  }

  private async importDocuments (
    alias: TypesenseCollectionName,
    collectionName: string,
    uuids?: string[]
  ): Promise<void> {
    const collector = this.collectors.get(alias)

    for await (const entities of collector.fetch(uuids)) {
      await this.addDocuments(collectionName, collector.transform(entities))
    }
  }

  private async addDocuments <T extends object> (
    collectionName: string,
    documents: T[]
  ): Promise<void> {
    const collection = this.client.collections(collectionName).documents()

    for (let i = 0; i < documents.length; i += TYPESENSE_BATCH_SIZE) {
      const documentsChunk = documents.slice(i, i + TYPESENSE_BATCH_SIZE)

      try {
        await collection.import(documentsChunk, { action: 'upsert' })
      } catch (e) {
        captureException(e)
        throw e
      }
    }
  }

  private async deleteUnusedCollectionsAndAliases (
    aliases: CollectionAliasSchema[],
    collections: CollectionSchema[]
  ): Promise<void> {
    const internalAliasNames = Object.values(TypesenseCollectionName) as string[]
    const aliasesToRemove = aliases.filter(a => !internalAliasNames.includes(a.name))

    for (const alias of aliasesToRemove) {
      await this.client.aliases(alias.name).delete()
    }

    const validAliases = aliases.filter(a => internalAliasNames.includes(a.name))
    const collectionsToRemove = collections.filter(c =>
      !validAliases.some(a => a.collection_name === c.name)
    )

    for (const collection of collectionsToRemove) {
      await this.client.collections(collection.name).delete()
    }
  }

  private async registerSynced (
    collections: TypesenseCollectionName[], dates: Date[]
  ): Promise<void> {
    const entities: QueryDeepPartialEntity<TypesenseSync>[] = collections.map((name, index) => ({
      collection: name,
      lastSyncedAt: dates[index]
    }))

    await this.syncRepository.upsert(
      entities,
      { conflictPaths: { collection: true } }
    )
  }

  private get client (): Client {
    return this.typesenseClient.client
  }
}
