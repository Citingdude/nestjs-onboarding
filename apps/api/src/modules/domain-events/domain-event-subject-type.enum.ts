import { type ApiPropertyOptions, ApiProperty } from '@nestjs/swagger'
import { buildMultiSelectEnumFilter } from '@wisemen/scoped-filter'
import type { MultiSelectFilter } from '@wisemen/scoped-filter/dist/multi-select/multi-select-filter.js'

export enum DomainEventSubjectType {
  API_KEY = 'api_key',
  CONTACT = 'contact',
  EXPORT = 'export',
  FILE = 'file',
  ROLE = 'role',
  USER = 'user'
}

export function DomainEventSubjectTypeApiProperty (
  options?: ApiPropertyOptions
): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: DomainEventSubjectType,
    enumName: 'DomainEventSubjectType'
  })
}

export const DomainEventSubjectTypeFilter = buildMultiSelectEnumFilter(
  DomainEventSubjectType,
  'DomainEventSubjectType'
)
export type DomainEventSubjectTypeFilter = MultiSelectFilter<DomainEventSubjectType>
