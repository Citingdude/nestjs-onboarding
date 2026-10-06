import { Equals, IsObject, IsOptional, ValidateNested } from 'class-validator'
import { IsUndefinable } from '@wisemen/validators'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { PaginatedKeysetQuery, PaginatedKeysetSearchQuery } from '@wisemen/pagination'
import { ViewApiKeyIndexQueryKey } from './view-api-key-index.query-key.js'

export class ViewApiKeyIndexPaginationQuery extends PaginatedKeysetQuery {
  @ApiProperty({ type: ViewApiKeyIndexQueryKey, required: false, nullable: true })
  @Type(() => ViewApiKeyIndexQueryKey)
  @ValidateNested()
  @IsObject()
  @IsOptional()
  key?: ViewApiKeyIndexQueryKey | null
}

export class ViewApiKeyIndexQuery extends PaginatedKeysetSearchQuery {
  @Equals(undefined)
  sort: never

  @Equals(undefined)
  order: never

  @Equals(undefined)
  filter: never

  @ApiProperty({ type: String, required: false })
  @IsUndefinable()
  search?: string

  @ApiProperty({ type: ViewApiKeyIndexPaginationQuery, required: false })
  @IsUndefinable()
  @Type(() => ViewApiKeyIndexPaginationQuery)
  @ValidateNested()
  @IsObject()
  pagination?: ViewApiKeyIndexPaginationQuery
}
