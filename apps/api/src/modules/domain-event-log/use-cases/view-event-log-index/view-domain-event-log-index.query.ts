import { Equals, IsEnum, IsObject, IsOptional, IsUUID, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsUndefinable } from '@wisemen/validators'
import { PaginatedKeysetQuery, PaginatedKeysetSearchQuery } from '@wisemen/pagination'
import { DateTimeRangeDto, IsDateTimeRange } from '@wisemen/datewise'
import { ViewDomainEventLogIndexQueryKey } from './view-domain-event-log-index.query.key.js'
import { DomainEventLogSource, DomainEventLogSourceApiProperty } from '#src/modules/domain-event-log/domain-event-log-source.enum.js'
import { DomainEventSubjectTypeFilter } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import { DomainEventActorIdFilter } from '#src/modules/domain-events/domain-event-actor-id.filter.js'
import { DomainEventActorTypeFilter } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

export class ViewDomainEventLogIndexPaginationQuery extends PaginatedKeysetQuery {
  @ApiProperty({ type: ViewDomainEventLogIndexQueryKey, required: false, nullable: true })
  @Type(() => ViewDomainEventLogIndexQueryKey)
  @ValidateNested()
  @IsObject()
  @IsOptional()
  key?: ViewDomainEventLogIndexQueryKey | null
}

export class ViewDomainEventLogIndexFilterQuery {
  @ApiProperty({ type: DomainEventSubjectTypeFilter, required: false })
  @IsUndefinable()
  @Type(() => DomainEventSubjectTypeFilter)
  @ValidateNested()
  @IsObject()
  subjectTypes?: DomainEventSubjectTypeFilter

  @ApiProperty({ type: 'string', format: 'uuid', required: false })
  @IsUndefinable()
  @IsUUID()
  subjectId?: string

  @ApiProperty({ type: DomainEventActorTypeFilter, required: false })
  @IsUndefinable()
  @Type(() => DomainEventActorTypeFilter)
  @ValidateNested()
  @IsObject()
  actorTypes?: DomainEventActorTypeFilter

  @ApiProperty({ type: DomainEventActorIdFilter, required: false })
  @IsUndefinable()
  @Type(() => DomainEventActorIdFilter)
  @ValidateNested()
  @IsObject()
  actorIds?: DomainEventActorIdFilter

  @DomainEventLogSourceApiProperty({ required: false })
  @IsUndefinable()
  @IsEnum(DomainEventLogSource)
  source?: DomainEventLogSource

  @ApiProperty({ type: DateTimeRangeDto, required: false })
  @IsUndefinable()
  @IsDateTimeRange()
  inRange?: DateTimeRangeDto
}

export class ViewDomainEventLogIndexQuery extends PaginatedKeysetSearchQuery {
  @Equals(undefined)
  sort: never

  @ApiProperty({ type: ViewDomainEventLogIndexFilterQuery, required: false })
  @IsUndefinable()
  @IsObject()
  @Type(() => ViewDomainEventLogIndexFilterQuery)
  @ValidateNested()
  filter?: ViewDomainEventLogIndexFilterQuery

  @Equals(undefined)
  search: never

  @ApiProperty({ type: ViewDomainEventLogIndexPaginationQuery, required: false })
  @IsUndefinable()
  @Type(() => ViewDomainEventLogIndexPaginationQuery)
  @ValidateNested()
  @IsObject()
  pagination?: ViewDomainEventLogIndexPaginationQuery
}
