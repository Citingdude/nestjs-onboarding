import { ApiProperty } from '@nestjs/swagger'
import type { PaginatedKeysetResponse, PaginatedKeysetResponseMeta } from '@wisemen/pagination'
import { ViewDomainEventLogIndexQueryKey } from './view-domain-event-log-index.query.key.js'
import { DomainEventSubjectType, DomainEventSubjectTypeApiProperty } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import { DomainEventActorType, DomainEventActorTypeApiProperty } from '#src/modules/domain-events/domain-event-actor-type.enum.js'
import { DomainEventTypeApiProperty } from '#src/modules/domain-events/domain-event-type.api-property.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { tcr } from '#src/modules/localization/helpers/translate.helper.js'
import type { DomainEventLogUuid } from '#src/modules/domain-event-log/domain-event-log.uuid.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'

export class ViewDomainEventLogIndexItemResponse {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: DomainEventLogUuid

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: string

  @ApiProperty({ type: 'integer', minimum: 0 })
  version: number

  @ApiProperty({ type: 'string' })
  source: string

  @DomainEventActorTypeApiProperty({ nullable: true })
  actorType: DomainEventActorType | null

  @ApiProperty({ type: 'string', nullable: true })
  actorId: string | null

  @ApiProperty({ type: 'string' })
  message: string

  @DomainEventTypeApiProperty()
  type: DomainEventType

  @DomainEventSubjectTypeApiProperty({ nullable: true })
  subjectType: DomainEventSubjectType | null

  @ApiProperty({ type: 'string', format: 'uuid', nullable: true })
  subjectId: string | null

  @ApiProperty()
  content: unknown

  constructor (log: DomainEventLog) {
    this.uuid = log.uuid
    this.createdAt = log.createdAt.toISOString()
    this.version = log.version
    this.source = log.source
    this.actorType = log.actorType
    this.actorId = log.actorId
    this.type = log.type
    this.content = log.content
    this.subjectType = log.subjectType
    this.subjectId = log.subjectId
    this.message = tcr(`event-log.${log.type}.v${log.version}`)
  }
}

class ViewDomainEventLogIndexResponseMeta implements PaginatedKeysetResponseMeta {
  @ApiProperty({ type: ViewDomainEventLogIndexQueryKey, nullable: true })
  next: ViewDomainEventLogIndexQueryKey | null

  constructor (logs: DomainEventLog[]) {
    this.next = ViewDomainEventLogIndexQueryKey.nextKey(logs)
  }
}

export class ViewDomainEventLogIndexResponse implements PaginatedKeysetResponse {
  @ApiProperty({ type: ViewDomainEventLogIndexItemResponse, isArray: true })
  items: ViewDomainEventLogIndexItemResponse[]

  @ApiProperty({ type: ViewDomainEventLogIndexResponseMeta })
  meta: ViewDomainEventLogIndexResponseMeta

  constructor (eventLogs: DomainEventLog[]) {
    this.items = eventLogs.map(log => new ViewDomainEventLogIndexItemResponse(log))
    this.meta = new ViewDomainEventLogIndexResponseMeta(eventLogs)
  }
}
