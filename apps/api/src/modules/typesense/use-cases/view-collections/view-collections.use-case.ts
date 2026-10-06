import { Injectable } from '@nestjs/common'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection.js'

@Injectable()
export class ViewCollectionsUseCase {
  constructor (private typesenseClient: TypesenseClient) {}

  async execute (): Promise<CollectionSchema[]> {
    return await this.typesenseClient.client.collections().retrieve()
  }
}
