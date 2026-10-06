import { Equals, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { PaginatedOffsetSearchQuery } from '@wisemen/pagination'

export class ViewUserIndexQuery extends PaginatedOffsetSearchQuery {
  @Equals(undefined)
  sort?: never

  @Equals(undefined)
  filter?: never

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  search?: string
}
