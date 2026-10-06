import type { ClassConstructor } from 'class-transformer'
import { applyDecorators, Injectable } from '@nestjs/common'
import { OneOfMeta } from '@wisemen/one-of'
import { Typesense, type InferDocumentType, type TypesenseCollection } from '@wisemen/nestjs-typesense'
import type { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { SearchCollectionsResponseItem } from '#src/modules/global-search/search-collections/search-collections.response.js'

const GLOBAL_SEARCH_COLLECTION_OPTIONS_KEY = Symbol('wisemen.global-search-collection-options')

export interface GlobalSearchCollectionOptions<
  TCollection extends
  TypesenseCollection<TypesenseCollectionName> = TypesenseCollection<TypesenseCollectionName>
> {
  collection: TCollection
  permissions: Permission[]
  response: { new (schema: InferDocumentType<TCollection>): unknown }
}

export function RegisterGlobalSearchCollection<
  TCollection extends
  TypesenseCollection<TypesenseCollectionName> = TypesenseCollection<TypesenseCollectionName>
> (
  options: GlobalSearchCollectionOptions<TCollection>
): ClassDecorator {
  // Apply OneOfMeta decorator to the response class
  const collectionName = Typesense.collectionName(options.collection)
  OneOfMeta(SearchCollectionsResponseItem, collectionName)(options.response)

  return applyDecorators(
    Injectable(),
    (target: ClassConstructor<unknown>): void => {
      Reflect.defineMetadata(GLOBAL_SEARCH_COLLECTION_OPTIONS_KEY, options, target)
    }
  )
}

export function isGlobalSearchCollectionContributor (provider: ClassConstructor<unknown>): boolean {
  return Reflect.getMetadata(GLOBAL_SEARCH_COLLECTION_OPTIONS_KEY, provider) !== undefined
}

export function getGlobalSearchCollectionMetadata (
  provider: ClassConstructor<unknown>
): GlobalSearchCollectionOptions {
  const config = Reflect.getMetadata(GLOBAL_SEARCH_COLLECTION_OPTIONS_KEY, provider) as unknown

  if (config === undefined) {
    throw new Error(`${provider.name} is not a valid global search collection contributor`
      + `\nDid you forget to add the @RegisterGlobalSearchCollection(...) decorator?`)
  }

  return config as GlobalSearchCollectionOptions
}
