import type { SortDirection } from '@wisemen/pagination'
import { PaginatedOffsetQuery } from '@wisemen/pagination'
import type { ViewContactIndexFilterQuery } from './view-contact-index-filter.query.js'
import { ViewContactIndexQuery } from './view-contact-index.query.js'
import type { ViewContactIndexSortQueryKey } from './view-contact-index-sort.query.js'

export class ViewContactIndexQueryBuilder {
  private readonly query: ViewContactIndexQuery

  constructor () {
    this.query = new ViewContactIndexQuery()
  }

  withSearch (search: string): this {
    this.query.search = search
    return this
  }

  withFilter (filter: ViewContactIndexFilterQuery): this {
    this.query.filter = filter
    return this
  }

  withSortOn (key: ViewContactIndexSortQueryKey, order: SortDirection): this {
    this.query.sort ??= []
    this.query.sort.push({ key, order })
    return this
  }

  withLimit (limit: number): this {
    this.query.pagination ??= new PaginatedOffsetQuery()
    this.query.pagination.limit = limit
    return this
  }

  withOffset (offset: number): this {
    this.query.pagination ??= new PaginatedOffsetQuery()
    this.query.pagination.offset = offset
    return this
  }

  build (): ViewContactIndexQuery {
    return this.query
  }
}
