import { Typesense, type TypesenseSearchParams } from '@wisemen/nestjs-typesense'
import { FilterOperator } from '@wisemen/nestjs-typesense/dist/params-builder/enums/typesense-filter-options.enum.js'
import { toBoolean } from '@wisemen/nestjs-common'
import { ContactCollection, type TypesenseContact } from './contact.typesense-collection.js'
import type { GlobalSearchCollection } from '#src/modules/global-search/collections/global-search-collection.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { SearchCollectionsQuery } from '#src/modules/global-search/search-collections/query/search-collections.query.js'
import { RegisterGlobalSearchCollection } from '#src/modules/global-search/collections/global-search-collection.decorator.js'
import { ContactGlobalSearchResponse } from '#src/app/contact/typesense/contact.global-search.response.js'

@RegisterGlobalSearchCollection({
  collection: ContactCollection,
  permissions: [Permission.CONTACT_READ],
  response: ContactGlobalSearchResponse
})
export class ContactGlobalSearchCollection implements GlobalSearchCollection<ContactCollection> {
  buildSearchParams (query: SearchCollectionsQuery): TypesenseSearchParams<TypesenseContact> {
    return Typesense.createSearchParamsBuilder(ContactCollection)
      .withQuery(query.search)
      .addSearchOn(ContactCollection.name)
      .addSearchOn(ContactCollection.email)
      .addFilterOn(
        ContactCollection.isActive,
        FilterOperator.EQUALS,
        query.filter?.contact?.isActive === undefined
          ? undefined
          : toBoolean(query.filter.contact.isActive)
      )
      .build()
  }
}
