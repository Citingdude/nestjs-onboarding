import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { natsSubject, NatsPublisher, type NatsPublisherEventWithSubject } from '@wisemen/nestjs-nats'
import { TodoDeletedEvent } from '#src/app/todo/use-cases/delete-todo/todo-deleted.event.js'
import { TodoDeletedIntegrationEvent, TodoDeletedNatsSubject } from '#src/app/todo/use-cases/delete-todo/integration/todo-deleted.integration.event.js'

@Injectable()
export class TodoDeletedIntegrationSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) {}

  @Subscribe(TodoDeletedEvent)
  async on (events: TodoDeletedEvent[]): Promise<void> {
    const integrationEvents: NatsPublisherEventWithSubject[] = []

    for (const event of events) {
      const todoUuid = event.content.uuid
      const integrationEvent = new TodoDeletedIntegrationEvent(todoUuid)
      const onSubject = natsSubject(TodoDeletedNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        uuid: todoUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publish(integrationEvents)
  }
}
