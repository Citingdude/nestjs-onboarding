import { ArrayMinSize, IsArray, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { PaginatedOffsetSearchQuery } from '@wisemen/pagination'
import { ViewContactIndexFilterQuery } from './view-contact-index-filter.query.js'
import { ViewContactIndexSortQuery } from './view-contact-index-sort.query.js'

export class ViewContactIndexQuery extends PaginatedOffsetSearchQuery {
  @ApiProperty({ type: ViewContactIndexSortQuery, required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @Type(() => ViewContactIndexSortQuery)
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  sort?: ViewContactIndexSortQuery[]

  @ApiProperty({ type: ViewContactIndexFilterQuery, required: false })
  @IsOptional()
  @Type(() => ViewContactIndexFilterQuery)
  @ValidateNested()
  filter?: ViewContactIndexFilterQuery

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string
}
