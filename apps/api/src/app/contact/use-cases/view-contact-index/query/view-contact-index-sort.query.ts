import { SortDirection, SortDirectionApiProperty, SortQuery } from '@wisemen/pagination'
import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum ViewContactIndexSortQueryKey {
  NAME = 'name'
}

export class ViewContactIndexSortQuery extends SortQuery {
  @ApiProperty({ enum: ViewContactIndexSortQueryKey, enumName: 'ViewContactIndexSortQueryKey' })
  @IsEnum(ViewContactIndexSortQueryKey)
  key: ViewContactIndexSortQueryKey

  @SortDirectionApiProperty()
  @IsEnum(SortDirection)
  order: SortDirection
}
