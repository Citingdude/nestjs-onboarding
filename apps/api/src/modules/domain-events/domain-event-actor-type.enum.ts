import { type ApiPropertyOptions, ApiProperty } from '@nestjs/swagger'
import { buildMultiSelectEnumFilter } from '@wisemen/scoped-filter'
import type { MultiSelectFilter } from '@wisemen/scoped-filter/dist/multi-select/multi-select-filter.js'

export enum DomainEventActorType {
  API_KEY = 'api_key',
  USER = 'user'
}

export function DomainEventActorTypeApiProperty (
  options?: ApiPropertyOptions
): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: DomainEventActorType,
    enumName: 'DomainEventActorType'
  })
}

export const DomainEventActorTypeFilter = buildMultiSelectEnumFilter(
  DomainEventActorType,
  'DomainEventActorType'
)
export type DomainEventActorTypeFilter = MultiSelectFilter<DomainEventActorType>
