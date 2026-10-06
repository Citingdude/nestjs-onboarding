import { SearchCollectionsQuery } from './search-collections.query.js'
import type { SearchCollectionsQueryKey } from './search-collections.query-key.js'
import type { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

export class SearchCollectionsQueryBuilder {
  private query: SearchCollectionsQuery
  constructor () {
    this.query = new SearchCollectionsQuery()
    this.query.search = 'test'
  }

  withSearch (search: string): this {
    this.query.search = search

    return this
  }

  withFilterOn (collections: TypesenseCollectionName[]): this {
    this.query.filter ??= {}
    this.query.filter.collections = collections

    return this
  }

  withContactActive (active: boolean): this {
    this.query.filter ??= {}
    this.query.filter.contact ??= {}
    this.query.filter.contact.isActive = String(active)
    return this
  }

  withKey (key: SearchCollectionsQueryKey | null): this {
    if (!key) {
      this.query.pagination = undefined
    } else {
      this.query.pagination = { key }
    }

    return this
  }

  withMaxResultsPerCollection (maxResults: number): this {
    this.query.pagination ??= {}
    this.query.pagination.maxResultsPerCollection = maxResults

    return this
  }

  build (): SearchCollectionsQuery {
    return this.query
  }
}
