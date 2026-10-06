import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { buildMultiSelectEnumFilter } from '@wisemen/scoped-filter'
import type { MultiSelectFilter } from '@wisemen/scoped-filter/dist/multi-select/multi-select-filter.js'
import type { ColumnOptions } from 'typeorm'
import { Column } from 'typeorm'

export enum ExportType {
  CONTACT_CSV = 'contact_csv',
  DOMAIN_EVENT_LOG_CSV = 'domain_event_log_csv'
}

export function ExportTypeApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: ExportType,
    enumName: 'ExportType'
  })
}

export const ExportTypeFilter = buildMultiSelectEnumFilter(ExportType, 'ExportType')
export type ExportTypeFilter = MultiSelectFilter<ExportType>

type ExportTypeColumnOptions = Omit<ColumnOptions, 'type' | 'enum' | 'enumName'>
export function ExportTypeColumn (
  options?: ExportTypeColumnOptions
): PropertyDecorator {
  return Column({
    ...options,
    type: 'enum',
    enum: ExportType,
    enumName: 'export_type'
  })
}
