import { PaginatedOffsetQuery, type SortDirection } from '@wisemen/pagination'
import type { ViewTodoIndexFilterQuery } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index-filter.query.js'
import type { ViewTodoIndexSortQueryKey } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index-sort.query.js'
import { ViewTodoIndexQuery } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index.query.js'

export class ViewTodoIndexQueryBuilder {
  private readonly query: ViewTodoIndexQuery

  constructor () {
    this.query = new ViewTodoIndexQuery()
  }

  withSearch (search: string): this {
    this.query.search = search
    return this
  }

  withFilter (filter: ViewTodoIndexFilterQuery): this {
    this.query.filter = filter
    return this
  }

  withSortOn (key: ViewTodoIndexSortQueryKey, order: SortDirection): this {
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

  build (): ViewTodoIndexQuery {
    return this.query
  }
}
