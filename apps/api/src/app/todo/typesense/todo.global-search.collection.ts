import { Typesense, type TypesenseSearchParams } from '@wisemen/nestjs-typesense'
import { FilterOperator } from '@wisemen/nestjs-typesense/dist/params-builder/enums/typesense-filter-options.enum.js'
import { toBoolean } from '@wisemen/nestjs-common'
import { TodoCollection, type TypesenseTodo } from '#src/app/todo/typesense/todo.typesense-collection.js'
import type { GlobalSearchCollection } from '#src/modules/global-search/collections/global-search-collection.js'
import type { SearchCollectionsQuery } from '#src/modules/global-search/search-collections/query/search-collections.query.js'

export class TodoGlobalSearchCollection implements GlobalSearchCollection<TodoCollection> {
  buildSearchParams (query: SearchCollectionsQuery): TypesenseSearchParams<TypesenseTodo> {
    return Typesense.createSearchParamsBuilder(TodoCollection)
      .withQuery(query.search)
      .addSearchOn(TodoCollection.title)
      .addSearchOn(TodoCollection.description)
      .addFilterOn(
        TodoCollection.completed,
        FilterOperator.EQUALS,
        query.filter?.todo?.completed === undefined
          ? undefined
          : toBoolean(query.filter.todo.completed)
      )
      .build()
  }
}
