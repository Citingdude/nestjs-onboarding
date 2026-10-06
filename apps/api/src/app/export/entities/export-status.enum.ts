import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { buildMultiSelectEnumFilter } from '@wisemen/scoped-filter'
import type { MultiSelectFilter } from '@wisemen/scoped-filter/dist/multi-select/multi-select-filter.js'
import type { ColumnOptions } from 'typeorm'
import { Column } from 'typeorm'

export enum ExportStatus {
  CREATED = 'created',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

export function ExportStatusApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: ExportStatus,
    enumName: 'ExportStatus'
  })
}

export const ExportStatusFilter = buildMultiSelectEnumFilter(ExportStatus, 'ExportStatus')
export type ExportStatusFilter = MultiSelectFilter<ExportStatus>

type ExportStatusColumnOptions = Omit<ColumnOptions, 'type' | 'enum' | 'enumName'>
export function ExportStatusColumn (
  options?: ExportStatusColumnOptions
): PropertyDecorator {
  return Column({
    ...options,
    type: 'enum',
    enum: ExportStatus,
    enumName: 'export_status'
  })
}
