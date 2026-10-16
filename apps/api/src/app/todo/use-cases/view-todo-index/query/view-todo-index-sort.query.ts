import { ApiProperty } from '@nestjs/swagger'
import { SortDirection, SortDirectionApiProperty, SortQuery } from '@wisemen/pagination'
import { IsEnum } from 'class-validator'

export enum ViewTodoIndexSortQueryKey {
  TITLE = 'title'
}

export class ViewTodoIndexSortQuery extends SortQuery {
  @ApiProperty({ enum: ViewTodoIndexSortQueryKey, enumName: 'ViewTodoIndexSortQueryKey' })
  @IsEnum(ViewTodoIndexSortQueryKey)
  key: ViewTodoIndexSortQueryKey

  @SortDirectionApiProperty()
  @IsEnum(SortDirection)
  order: SortDirection
}
