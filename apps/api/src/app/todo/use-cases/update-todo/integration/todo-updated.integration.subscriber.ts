import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { natsSubject, NatsPublisher, type NatsPublisherEventWithSubject } from '@wisemen/nestjs-nats'
import { TodoUpdatedEvent } from '#src/app/todo/use-cases/update-todo/todo-updated.event.js'
import { TodoUpdatedIntegrationEvent, TodoUpdatedNatsSubject } from '#src/app/todo/use-cases/update-todo/integration/todo-updated.integration.event.js'

@Injectable()
export class TodoUpdatedIntegrationSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) {}

  @Subscribe(TodoUpdatedEvent)
  async on (events: TodoUpdatedEvent[]): Promise<void> {
    const integrationEvents: NatsPublisherEventWithSubject[] = []

    for (const event of events) {
      const todoUuid = event.content.uuid
      const integrationEvent = new TodoUpdatedIntegrationEvent(todoUuid)
      const onSubject = natsSubject(TodoUpdatedNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        uuid: todoUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publish(integrationEvents)
  }
}
