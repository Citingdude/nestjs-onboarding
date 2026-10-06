import { Injectable } from '@nestjs/common'
import { TypesenseClient, type TypesenseCollection } from '@wisemen/nestjs-typesense'
import type { MappedMultiSearchResponseItem, MultiSearchRequestSchema, MultiSearchResponse } from '@wisemen/nestjs-typesense/dist/client/typesense-multi-search.type.js'
import { SearchCollectionsResponse, type SearchCollectionsResultItem } from './search-collections.response.js'
import { SearchCollectionsQuery } from './query/search-collections.query.js'
import { SEARCH_COLLECTIONS_LIMIT } from './search-collections.constants.js'
import { GlobalSearchCollections } from '#src/modules/global-search/collections/global-search-collections.js'
import type { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

@Injectable()
export class SearchCollectionsUseCase {
  constructor (
    private typesense: TypesenseClient,
    private globalSearchCollections: GlobalSearchCollections
  ) {}

  async execute (query: SearchCollectionsQuery): Promise<SearchCollectionsResponse> {
    const searchParams: MultiSearchRequestSchema<
      TypesenseCollection<TypesenseCollectionName>
    >[] = []

    const collections = query.filter?.collections ?? this.globalSearchCollections.collectionNames()
    for (const collection of collections) {
      const params = this.globalSearchCollections.buildSearchParams(collection, query)
      searchParams.push({ ...params, collection })
    }

    const qryOffset = Number(query.pagination?.key?.offset ?? 0)
    const offset = Math.max(0, qryOffset)
    const limit = query.pagination?.maxResultsPerCollection ?? SEARCH_COLLECTIONS_LIMIT
    const searchResult = await this.typesense.multiSearch(searchParams, { offset, limit })
    const sortedResults = this.mapAndSortResults(searchResult)
    const responseItems: Omit<SearchCollectionsResultItem, 'collectionsService'>[] = sortedResults.map(item => ({
      collection: item.collection,
      entity: this.globalSearchCollections.createResponse(item.collection, item.item),
      textMatch: item.text_match
    }))

    return new SearchCollectionsResponse(responseItems, offset + limit)
  }

  private mapAndSortResults <
    TCollectionName extends string, TCollection extends TypesenseCollection<TCollectionName>
  > (
    searchResult: MultiSearchResponse<TCollection>
  ): MappedMultiSearchResponseItem<TCollection>[] {
    const results: MappedMultiSearchResponseItem<TCollection>[] = []

    let collection: TCollectionName

    for (collection in searchResult) {
      const collectionResults = searchResult[collection]

      for (const result of collectionResults) {
        results.push({
          collection: collection,
          item: result.item,
          text_match: result.text_match
        })
      }
    }

    return results.sort((a, b) => b.text_match - a.text_match)
  }
}
