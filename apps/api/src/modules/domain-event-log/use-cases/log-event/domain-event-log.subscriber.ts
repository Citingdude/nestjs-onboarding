import { Injectable } from '@nestjs/common'
import { trace } from '@opentelemetry/api'
import { DomainEvent, SubscribeToAll } from '@wisemen/nestjs-domain-events'
import { DomainEventLogContext } from '#src/modules/domain-event-log/modules/domain-event-log-context/domain-event-log.context.js'
import { DomainEventLogActorContext } from '#src/modules/domain-event-log/modules/domain-event-log-actor-context/domain-event-log-actor.context.js'
import { DomainEventLogBuilder } from '#src/modules/domain-event-log/domain-event-log.entity.builder.js'
import type { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { DomainEventLogUuid } from '#src/modules/domain-event-log/domain-event-log.uuid.js'

@Injectable()
export class DomainEventLogSubscriber {
  constructor (
    private actorContext: DomainEventLogActorContext,
    private logContext: DomainEventLogContext
  ) {}

  @SubscribeToAll()
  handle (events: DomainEvent[]): void {
    const span = trace.getActiveSpan()
    const actor = this.actorContext.getActor()

    for (const event of events) {
      const log = new DomainEventLogBuilder()
        .withUuid(event.id as DomainEventLogUuid)
        .withCreatedAt(event.createdAt)
        .withSource(event.source)
        .withType(event.type as DomainEventType)
        .withVersion(event.version)
        .withContent(event.content)
        .withSubjectType(event.subjectType as DomainEventSubjectType)
        .withSubjectId(event.subjectId)
        .withActorType(actor.actorType)
        .withActorId(actor.actorId)
        .withTraceId(span?.spanContext().traceId ?? null)
        .build()
      this.logContext.addLogs(log)
    }
  }
}
