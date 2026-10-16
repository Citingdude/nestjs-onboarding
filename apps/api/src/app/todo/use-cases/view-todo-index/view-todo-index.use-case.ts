import { Typesense, TypesenseClient } from '@wisemen/nestjs-typesense'
import { FilterOperator } from '@wisemen/nestjs-typesense/dist/params-builder/enums/typesense-filter-options.enum.js'
import { exhaustiveCheck, toBoolean } from '@wisemen/nestjs-common'
import { Injectable } from '@nestjs/common'
import { ViewTodoIndexResponse } from '#src/app/todo/use-cases/view-todo-index/view-todo-index.response.js'
import type { ViewTodoIndexQuery } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index.query.js'
import { TodoCollection } from '#src/app/todo/typesense/todo.typesense-collection.js'
import { ViewTodoIndexSortQueryKey } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index-sort.query.js'

@Injectable()
export class ViewTodoIndexUseCase {
  constructor (
    private typesense: TypesenseClient
  ) {}

  public async execute (
    query: ViewTodoIndexQuery
  ): Promise<ViewTodoIndexResponse> {
    const pb = Typesense.createSearchParamsBuilder(TodoCollection)
      .withQuery(query?.search)
      .withLimit(query.pagination?.limit)
      .withOffset(query.pagination?.offset)

    if (query.filter?.completed != null) {
      pb.addFilterOn(
        TodoCollection.completed,
        FilterOperator.EQUALS,
        toBoolean(query.filter.completed)
      )
    }

    pb.addSearchOn(TodoCollection.title)
      .addSearchOn(TodoCollection.description)

    if (query.sort != null) {
      for (const sort of query.sort) {
        switch (sort.key) {
          case ViewTodoIndexSortQueryKey.TITLE:
            pb.addSortOn(TodoCollection.title, sort.order)
            break
          default:
            exhaustiveCheck(sort.key)
        }
      }
    }

    const searchResult = await this.typesense.search(TodoCollection, pb.build())

    return new ViewTodoIndexResponse(searchResult)
  }
}
