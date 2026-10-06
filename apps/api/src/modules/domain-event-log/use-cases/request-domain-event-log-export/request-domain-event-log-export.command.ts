import { IsEnum, IsObject, IsUUID, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { IsUndefinable } from '@wisemen/validators'
import { DateTimeRangeDto, IsDateTimeRange } from '@wisemen/datewise'
import { Type } from 'class-transformer'
import { DomainEventLogSourceApiProperty, DomainEventLogSource } from '#src/modules/domain-event-log/domain-event-log-source.enum.js'
import { DomainEventSubjectTypeFilter } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import { DomainEventActorIdFilter } from '#src/modules/domain-events/domain-event-actor-id.filter.js'
import { DomainEventActorTypeFilter } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

export class RequestDomainEventLogExportCommand {
  @ApiProperty({ type: DomainEventSubjectTypeFilter, required: false })
  @IsUndefinable()
  @Type(() => DomainEventSubjectTypeFilter)
  @IsObject()
  @ValidateNested()
  subjectTypes?: DomainEventSubjectTypeFilter

  @ApiProperty({ type: 'string', format: 'uuid', required: false })
  @IsUndefinable()
  @IsUUID()
  subjectId?: string

  @ApiProperty({ type: DomainEventActorTypeFilter, required: false })
  @IsUndefinable()
  @Type(() => DomainEventActorTypeFilter)
  @IsObject()
  @ValidateNested()
  actorTypes?: DomainEventActorTypeFilter

  @ApiProperty({ type: DomainEventActorIdFilter, required: false })
  @IsUndefinable()
  @Type(() => DomainEventActorIdFilter)
  @IsObject()
  @ValidateNested()
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
