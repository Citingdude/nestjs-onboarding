import { ApiProperty } from '@nestjs/swagger'
import { OneOfApiExtraModels, OneOfApiProperty, OneOfMetaApiProperty, OneOfResponse, OneOfTypeApiProperty } from '@wisemen/one-of'
import { SearchCollectionsQueryKey } from '#src/modules/global-search/search-collections/query/search-collections.query-key.js'
import type { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

export interface SearchCollectionsResultItem<
  T extends TypesenseCollectionName = TypesenseCollectionName
> {
  collection: T
  entity: unknown
  textMatch: number
}

@OneOfResponse(SearchCollectionsResponseItem)
export class SearchCollectionsResponseItem {
  @OneOfTypeApiProperty()
  collection: TypesenseCollectionName

  @OneOfMetaApiProperty()
  entity: unknown

  @ApiProperty({ type: 'number' })
  textMatch: number

  constructor (searchCollectionsItem: SearchCollectionsResultItem) {
    this.collection = searchCollectionsItem.collection
    this.entity = searchCollectionsItem.entity
    this.textMatch = searchCollectionsItem.textMatch
  }
}

export class SearchCollectionsMetaResponse {
  @ApiProperty({ type: SearchCollectionsQueryKey, nullable: true })
  next: SearchCollectionsQueryKey | null
}

@OneOfApiExtraModels(SearchCollectionsResponseItem)
export class SearchCollectionsResponse {
  @OneOfApiProperty(SearchCollectionsResponseItem, { isArray: true })
  declare items: SearchCollectionsResponseItem[]

  @ApiProperty({ type: SearchCollectionsMetaResponse })
  meta: SearchCollectionsMetaResponse

  constructor (searchResults: SearchCollectionsResultItem[], nextOffset: number) {
    this.items = searchResults.map(item => new SearchCollectionsResponseItem(item))

    if (searchResults.length === 0) {
      this.meta = { next: null }
    } else {
      this.meta = { next: { offset: String(nextOffset) } }
    }
  }
}
