import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { Equals, ValidateNested, IsNotEmpty, IsString, IsEnum, IsArray, IsOptional, IsObject, IsBooleanString, IsInt, Min, Max } from 'class-validator'
import { IsUndefinable } from '@wisemen/validators'
import { OneOfTypesApiProperty } from '@wisemen/one-of'
import { SearchCollectionsQueryKey } from './search-collections.query-key.js'
import { SearchCollectionsResponseItem } from '#src/modules/global-search/search-collections/search-collections.response.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { SEARCH_COLLECTIONS_LIMIT } from '#src/modules/global-search/search-collections/search-collections.constants.js'

export class SearchCollectionsFilterContactQuery {
  @ApiProperty({ type: 'boolean', required: false })
  @IsUndefinable()
  @IsBooleanString()
  isActive?: string
}

export class SearchCollectionsFilterQuery {
  @OneOfTypesApiProperty(SearchCollectionsResponseItem, { required: false, isArray: true })
  @IsOptional()
  @IsEnum(TypesenseCollectionName, { each: true })
  @IsArray()
  collections?: TypesenseCollectionName[]

  @ApiProperty({ type: SearchCollectionsFilterContactQuery, required: false })
  @IsObject()
  @IsOptional()
  @Type(() => SearchCollectionsFilterContactQuery)
  @ValidateNested()
  contact?: SearchCollectionsFilterContactQuery
}

export class SearchCollectionPaginationQuery {
  @ApiProperty({ type: SearchCollectionsQueryKey, required: false })
  @IsUndefinable()
  @Type(() => SearchCollectionsQueryKey)
  @ValidateNested()
  @IsObject()
  key?: SearchCollectionsQueryKey

  @ApiProperty({
    type: Number,
    required: false,
    minimum: 1,
    maximum: SEARCH_COLLECTIONS_LIMIT
  })
  @Type(() => Number)
  @IsUndefinable()
  @IsInt()
  @Min(1)
  @Max(SEARCH_COLLECTIONS_LIMIT)
  maxResultsPerCollection?: number
}

export class SearchCollectionsQuery {
  @Equals(undefined)
  sort?: never

  @ApiProperty({ type: SearchCollectionsFilterQuery, required: false })
  @Type(() => SearchCollectionsFilterQuery)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  filter?: SearchCollectionsFilterQuery

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  search: string

  @ApiProperty({ type: SearchCollectionPaginationQuery, required: false })
  @IsUndefinable()
  @Type(() => SearchCollectionPaginationQuery)
  @IsObject()
  @ValidateNested()
  pagination?: SearchCollectionPaginationQuery
}
