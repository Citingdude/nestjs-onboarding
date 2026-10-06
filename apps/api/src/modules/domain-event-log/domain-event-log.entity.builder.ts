import { generateUuid } from '@wisemen/nestjs-common'
import { DomainEventLog } from './domain-event-log.entity.js'
import type { DomainEventLogUuid } from './domain-event-log.uuid.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

export class DomainEventLogBuilder {
  private readonly log: DomainEventLog

  constructor () {
    this.log = new DomainEventLog()
    this.log.uuid = generateUuid()
    this.log.createdAt = new Date()
    this.log.actorType = null
    this.log.actorId = null
    this.log.type = DomainEventType.USER_CREATED
    this.log.source = 'tests'
    this.log.content = {}
    this.log.version = 0
  }

  withUuid (uuid: DomainEventLogUuid): this {
    this.log.uuid = uuid
    return this
  }

  withCreatedAt (date: Date): this {
    this.log.createdAt = date
    return this
  }

  withVersion (version: number): this {
    this.log.version = version
    return this
  }

  withSource (source: string): this {
    this.log.source = source
    return this
  }

  withType (type: DomainEventType): this {
    this.log.type = type
    return this
  }

  withContent (content: object): this {
    this.log.content = content
    return this
  }

  withSubjectType (type?: DomainEventSubjectType | null): this {
    this.log.subjectType = type ?? null
    return this
  }

  withSubjectId (id?: string | null): this {
    this.log.subjectId = id ?? null
    return this
  }

  withActorType (type: DomainEventActorType | null): this {
    this.log.actorType = type
    return this
  }

  withActorId (id: string | null): this {
    this.log.actorId = id
    return this
  }

  withTraceId (traceId: string | null): this {
    this.log.traceId = traceId
    return this
  }

  build (): DomainEventLog {
    return this.log
  }
}
