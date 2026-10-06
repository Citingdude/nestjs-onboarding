import { Typesense, type TypesenseSearchParams } from '@wisemen/nestjs-typesense'
import { UserCollection, type TypesenseUser } from './user.typesense-collection.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { SearchCollectionsQuery } from '#src/modules/global-search/search-collections/query/search-collections.query.js'
import { RegisterGlobalSearchCollection } from '#src/modules/global-search/collections/global-search-collection.decorator.js'
import type { GlobalSearchCollection as GlobalSearchCollection } from '#src/modules/global-search/collections/global-search-collection.js'
import { UserGlobalSearchResponse } from '#src/modules/auth/users/typesense/user.global-search.response.js'

@RegisterGlobalSearchCollection({
  collection: UserCollection,
  permissions: [Permission.USER_READ],
  response: UserGlobalSearchResponse
})
export class UserGlobalSearchCollection implements GlobalSearchCollection<UserCollection> {
  buildSearchParams (
    query: SearchCollectionsQuery
  ): TypesenseSearchParams<TypesenseUser> {
    return Typesense.createSearchParamsBuilder(UserCollection)
      .withQuery(query.search)
      .addSearchOn(UserCollection.firstName)
      .addSearchOn(UserCollection.lastName)
      .addSearchOn(UserCollection.email)
      .build()
  }
}
