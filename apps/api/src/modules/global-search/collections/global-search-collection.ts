import type { InferDocumentType, TypesenseCollection, TypesenseSearchParams } from '@wisemen/nestjs-typesense'
import type { SearchCollectionsQuery } from '#src/modules/global-search/search-collections/query/search-collections.query.js'

export interface GlobalSearchCollection<
  TCollection extends TypesenseCollection = TypesenseCollection
> {
  buildSearchParams: (
    query: SearchCollectionsQuery
  ) => TypesenseSearchParams<InferDocumentType<TCollection>>
}
