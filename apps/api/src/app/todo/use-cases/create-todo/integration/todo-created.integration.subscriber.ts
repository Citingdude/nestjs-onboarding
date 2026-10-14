import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { natsSubject, NatsPublisher, type NatsPublisherEventWithSubject } from '@wisemen/nestjs-nats'
import { TodoCreatedEvent } from '#src/app/todo/use-cases/create-todo/todo-created.event.js'
import { TodoCreatedIntegrationEvent, TodoCreatedNatsSubject } from '#src/app/todo/use-cases/create-todo/integration/todo-created.integration.event.js'

@Injectable()
export class TodoCreatedIntegrationSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) {}

  @Subscribe(TodoCreatedEvent)
  async on (events: TodoCreatedEvent[]): Promise<void> {
    const integrationEvents: NatsPublisherEventWithSubject[] = []

    for (const event of events) {
      const todoUuid = event.content.uuid
      const integrationEvent = new TodoCreatedIntegrationEvent(todoUuid)
      const onSubject = natsSubject(TodoCreatedNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        uuid: todoUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publish(integrationEvents)
  }
}
