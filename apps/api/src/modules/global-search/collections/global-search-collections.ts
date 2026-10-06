import { Injectable, type OnApplicationBootstrap } from '@nestjs/common'
import type { SearchParams } from 'typesense'
import { ProviderExplorer } from '@wisemen/nestjs-provider-explorer'
import { Typesense, type TypesenseCollection, type InferDocumentType } from '@wisemen/nestjs-typesense'
import type { GlobalSearchCollection } from './global-search-collection.js'
import { getGlobalSearchCollectionMetadata, isGlobalSearchCollectionContributor, type GlobalSearchCollectionOptions } from './global-search-collection.decorator.js'
import type { SearchCollectionsQuery } from '#src/modules/global-search/search-collections/query/search-collections.query.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

@Injectable()
export class GlobalSearchCollections implements OnApplicationBootstrap {
  private collections = new Map<TypesenseCollectionName, GlobalSearchCollection>()
  private metadata = new Map<TypesenseCollectionName, GlobalSearchCollectionOptions>()

  constructor (
    private ProviderExplorer: ProviderExplorer
  ) {}

  onApplicationBootstrap (): void {
    for (const provider of this.ProviderExplorer.providers) {
      if (!isGlobalSearchCollectionContributor(provider.providerClass)) {
        continue
      }

      const options = getGlobalSearchCollectionMetadata(provider.providerClass)
      const contributor = provider.providerInstance as GlobalSearchCollection
      const collectionName = Typesense.collectionName(options.collection)

      if (this.collections.has(collectionName)) {
        throw new Error(`Duplicate global search contributor for ${collectionName}`)
      }

      this.collections.set(collectionName, contributor)
      this.metadata.set(collectionName, options)
    }
  }

  collectionNames (): TypesenseCollectionName[] {
    return Array.from(this.collections.keys())
  }

  getPermissions (collection: TypesenseCollectionName): Permission[] {
    return this.getMetadata(collection).permissions
  }

  getResponseModels (): Array<new (...args: never[]) => object> {
    return this.collectionNames().map(collection =>
      this.getMetadata(collection).response as new (...args: never[]) => object
    )
  }

  buildSearchParams (
    collection: TypesenseCollectionName,
    query: SearchCollectionsQuery
  ): SearchParams<object> {
    return this.get(collection).buildSearchParams(query)
  }

  createResponse<
    TCollectionName extends string,
    TCollection extends TypesenseCollection<TCollectionName>
  >(
    collection: TypesenseCollectionName,
    entity: InferDocumentType<TCollection>
  ): unknown {
    const ResponseClass = this.getMetadata(collection).response
    return new ResponseClass(entity)
  }

  get (collection: TypesenseCollectionName): GlobalSearchCollection {
    const contributor = this.collections.get(collection)

    if (contributor === undefined) {
      throw new Error(`No global search contributor set for ${collection}`
        + `\n - Did you forget to add a @RegisterGlobalSearchCollection({...}) decorator?`
        + `\n - Did you forget to add the contributor as a provider in the collection's module?`
        + `\n - Did you forget to import the collection's module in the typesense module?`)
    }

    return contributor
  }

  private getMetadata (collection: TypesenseCollectionName): GlobalSearchCollectionOptions {
    const options = this.metadata.get(collection)

    if (options === undefined) {
      throw new Error(`No metadata found for global search collection ${collection}`)
    }

    return options
  }
}
