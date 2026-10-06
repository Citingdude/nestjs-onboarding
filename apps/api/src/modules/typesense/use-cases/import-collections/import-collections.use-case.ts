import { Injectable } from '@nestjs/common'
import { captureException } from '@wisemen/opentelemetry'
import { TypesenseClient, TypesenseCollectors } from '@wisemen/nestjs-typesense'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { TYPESENSE_BATCH_SIZE } from '#src/modules/typesense/typesense.constant.js'

@Injectable()
export class ImportCollectionsUseCase {
  constructor (
    private typesenseClient: TypesenseClient,
    private collectors: TypesenseCollectors
  ) {}

  async execute (indexes: TypesenseCollectionName[]): Promise<void> {
    for (const collection of indexes) {
      await this.importCollection(collection)
    }
  }

  private async importCollection (collection: TypesenseCollectionName): Promise<void> {
    const collector = this.collectors.get(collection)
    const collectorResult = collector.fetch()

    for await (const entities of collectorResult) {
      await this.addDocuments(collection, collector.transform(entities))
    }
  }

  private async addDocuments <T extends object> (
    index: TypesenseCollectionName,
    documents: T[]
  ): Promise<void> {
    for (let i = 0; i < documents.length; i += TYPESENSE_BATCH_SIZE) {
      const documentsChunk = documents.slice(i, i + TYPESENSE_BATCH_SIZE)

      try {
        const alias = await this.typesenseClient.client.aliases(index).retrieve()
        const collectionName = alias.collection_name
        const collection = this.typesenseClient.client.collections(collectionName)

        await collection.documents().import(documentsChunk, { action: 'upsert' })
      } catch (e) {
        captureException(e)
        throw e
      }
    }
  }
}
