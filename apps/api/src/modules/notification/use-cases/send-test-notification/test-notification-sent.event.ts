import { RegisterDomainEvent, DomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'

export class TestNotificationSentEventContent {
  constructor (readonly message: string) {}
}

@RegisterDomainEvent(DomainEventType.TEST_NOTIFICATION_SENT, 1)
export class TestNotificationSentEvent extends DomainEvent<TestNotificationSentEventContent> {
  constructor (message: string) {
    super({ content: new TestNotificationSentEventContent(message) })
  }
}
