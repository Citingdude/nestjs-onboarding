import type { SearchParams } from 'typesense'
import type { SearchCollectionsQuery } from '#src/modules/global-search/search-collections/query/search-collections.query.js'

export interface GlobalSearchCollection {
  buildSearchParams: (query: SearchCollectionsQuery) => SearchParams<object>
}
