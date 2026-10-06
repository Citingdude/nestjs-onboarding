import { Controller, Get, Query, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RequireFlags } from '@wisemen/nestjs-feature-flags'
import { SearchCollectionsUseCase } from './search-collections.use-case.js'
import { SearchCollectionsQuery } from './query/search-collections.query.js'
import { SearchCollectionsResponse } from './search-collections.response.js'
import { SEARCH_COLLECTIONS_LIMIT } from './search-collections.constants.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { GlobalSearchCollections } from '#src/modules/global-search/collections/global-search-collections.js'
import type { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { SearchCollectionsFlag } from '#src/modules/global-search/search-collections/search-collections.flag.js'

@ApiTags('Global Search')
@ApiOAuth2([])
@Controller()
export class SearchCollectionsController {
  constructor (
    private authContext: AuthContext,
    private collections: GlobalSearchCollections,
    private useCase: SearchCollectionsUseCase
  ) {}

  @Get('search')
  @Version('1')
  @RequireFlags(SearchCollectionsFlag)
  @ApiOkResponse({ type: SearchCollectionsResponse })
  async globalSearch (
    @Query() query: SearchCollectionsQuery
  ): Promise<SearchCollectionsResponse> {
    const allowedCollections = await this.getAllowedCollections()

    const collections = query.filter?.collections ?? this.collections.collectionNames()
    const filteredCollections = collections.filter(c => allowedCollections.includes(c))

    if (filteredCollections.length === 0) {
      return new SearchCollectionsResponse([], SEARCH_COLLECTIONS_LIMIT)
    }

    query.filter ??= {}
    query.filter.collections = filteredCollections

    return await this.useCase.execute(query)
  }

  private async getAllowedCollections (): Promise<TypesenseCollectionName[]> {
    const permissions = await this.authContext.getPermissions()
    const collectionNames = this.collections.collectionNames()

    if (permissions.hasAllPermissions) {
      return collectionNames
    }

    return collectionNames.filter((collection) => {
      const requiredPermissions = this.collections.getPermissions(collection)

      if (requiredPermissions.length === 0) {
        return true
      }

      return permissions.hasAny(requiredPermissions)
    })
  }
}
