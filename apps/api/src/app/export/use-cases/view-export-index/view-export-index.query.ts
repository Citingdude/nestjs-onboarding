import { Equals, IsObject, IsOptional, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsUndefinable } from '@wisemen/validators'
import { PaginatedKeysetQuery, PaginatedKeysetSearchQuery } from '@wisemen/pagination'
import { ViewExportIndexQueryKey } from './view-export-index.query.key.js'
import { ExportStatusFilter } from '#src/app/export/entities/export-status.enum.js'
import { ExportTypeFilter } from '#src/app/export/entities/export-type.enum.js'

export class ViewExportIndexPaginationQuery extends PaginatedKeysetQuery {
  @ApiProperty({ type: ViewExportIndexQueryKey, required: false, nullable: true })
  @Type(() => ViewExportIndexQueryKey)
  @ValidateNested()
  @IsObject()
  @IsOptional()
  key?: ViewExportIndexQueryKey | null
}

export class ViewExportIndexFilterQuery {
  @ApiProperty({ type: ExportStatusFilter, required: false })
  @IsUndefinable()
  @Type(() => ExportStatusFilter)
  @IsObject()
  @ValidateNested()
  status?: ExportStatusFilter

  @ApiProperty({ type: ExportTypeFilter, required: false })
  @IsUndefinable()
  @Type(() => ExportTypeFilter)
  @IsObject()
  @ValidateNested()
  type?: ExportTypeFilter
}

export class ViewExportIndexQuery extends PaginatedKeysetSearchQuery {
  @Equals(undefined)
  sort: never

  @ApiProperty({ type: ViewExportIndexFilterQuery, required: false })
  @IsUndefinable()
  @IsObject()
  @Type(() => ViewExportIndexFilterQuery)
  @ValidateNested()
  filter?: ViewExportIndexFilterQuery

  @Equals(undefined)
  search: never

  @ApiProperty({ type: ViewExportIndexPaginationQuery, required: false })
  @IsUndefinable()
  @Type(() => ViewExportIndexPaginationQuery)
  @ValidateNested()
  @IsObject()
  pagination?: ViewExportIndexPaginationQuery
}
