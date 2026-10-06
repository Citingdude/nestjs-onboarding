import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { buildMultiSelectFilter } from '@wisemen/scoped-filter'
import type { MultiSelectFilter } from '@wisemen/scoped-filter/dist/multi-select/multi-select-filter.js'

export const DomainEventActorIdFilter = buildMultiSelectFilter<string>(
  'ScopedDomainEventActorIdFilter',
  ApiProperty({ type: 'string', isArray: true }),
  IsString({ each: true })
)
export type DomainEventActorIdFilter = MultiSelectFilter<string>
