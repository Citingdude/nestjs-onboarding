import { PaginatedOffsetSearchQuery } from '@wisemen/pagination'
import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ViewTodoIndexSortQuery } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index-sort.query.js'
import { ViewTodoIndexFilterQuery } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index-filter.query.js'

export class ViewTodoIndexQuery extends PaginatedOffsetSearchQuery {
  @ApiProperty({ type: ViewTodoIndexSortQuery, required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @Type(() => ViewTodoIndexSortQuery)
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  sort?: ViewTodoIndexSortQuery[]

  @ApiProperty({ type: ViewTodoIndexFilterQuery, required: false })
  @IsOptional()
  @Type(() => ViewTodoIndexFilterQuery)
  @ValidateNested()
  filter?: ViewTodoIndexFilterQuery

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string
}
