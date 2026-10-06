import { Injectable } from '@nestjs/common'
import { Typesense, TypesenseClient } from '@wisemen/nestjs-typesense'
import { FilterOperator } from '@wisemen/nestjs-typesense/dist/params-builder/enums/typesense-filter-options.enum.js'
import { exhaustiveCheck, toBoolean } from '@wisemen/nestjs-common'
import { ViewContactIndexResponse } from './view-contact-index.response.js'
import { ViewContactIndexQuery } from './query/view-contact-index.query.js'
import { ContactCollection } from '#src/app/contact/typesense/contact.typesense-collection.js'
import { ViewContactIndexSortQueryKey } from '#src/app/contact/use-cases/view-contact-index/query/view-contact-index-sort.query.js'

@Injectable()
export class ViewContactIndexUseCase {
  constructor (
    private typesense: TypesenseClient
  ) { }

  public async execute (
    query: ViewContactIndexQuery
  ): Promise<ViewContactIndexResponse> {
    const pb = Typesense.createSearchParamsBuilder(ContactCollection)
      .withQuery(query.search)
      .withLimit(query.pagination?.limit)
      .withOffset(query.pagination?.offset)

    if (query.filter?.isActive != null) {
      pb.addFilterOn(
        ContactCollection.isActive,
        FilterOperator.EQUALS,
        toBoolean(query.filter.isActive)
      )
    }

    pb.addSearchOn(ContactCollection.name)
      .addSearchOn(ContactCollection.email)
      .addSearchOn(ContactCollection.phone)
      .addSearchOn(ContactCollection.city)
      .addSearchOn(ContactCollection.country)
      .addSearchOn(ContactCollection.postalCode)
      .addSearchOn(ContactCollection.streetName)
      .addSearchOn(ContactCollection.streetNumber)
      .addSearchOn(ContactCollection.unit)

    if (query.sort != null) {
      for (const sort of query.sort) {
        switch (sort.key) {
          case ViewContactIndexSortQueryKey.NAME:
            pb.addSortOn(ContactCollection.name, sort.order)
            break
          default:
            exhaustiveCheck(sort.key)
        }
      }
    }

    const searchResult = await this.typesense.search(ContactCollection, pb.build())

    return new ViewContactIndexResponse(searchResult)
  }
}
