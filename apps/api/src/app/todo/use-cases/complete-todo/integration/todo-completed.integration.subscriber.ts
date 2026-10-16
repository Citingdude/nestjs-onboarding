import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { natsSubject, NatsPublisher, type NatsPublisherEventWithSubject } from '@wisemen/nestjs-nats'
import { TodoCompletedEvent } from '#src/app/todo/use-cases/complete-todo/todo-completed.event.js'
import { TodoCompletedIntegrationEvent, TodoCompletedNatsSubject } from '#src/app/todo/use-cases/complete-todo/integration/todo-completed.integration.event.js'

@Injectable()
export class TodoCompletedIntegrationSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) {}

  @Subscribe(TodoCompletedEvent)
  async on (events: TodoCompletedEvent[]): Promise<void> {
    const integrationEvents: NatsPublisherEventWithSubject[] = []

    for (const event of events) {
      const todoUuid = event.content.uuid
      const integrationEvent = new TodoCompletedIntegrationEvent(todoUuid)
      const onSubject = natsSubject(TodoCompletedNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        uuid: todoUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publish(integrationEvents)
  }
}
