import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { natsSubject, NatsPublisher, type NatsPublisherEventWithSubject } from '@wisemen/nestjs-nats'
import { TodoUncompletedEvent } from '#src/app/todo/use-cases/uncomplete-todo/todo-uncompleted.event.js'
import { TodoUncompletedIntegrationEvent, TodoUncompletedNatsSubject } from '#src/app/todo/use-cases/uncomplete-todo/integration/todo-uncompleted.integration.event.js'

@Injectable()
export class TodoUncompletedIntegrationSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) {}

  @Subscribe(TodoUncompletedEvent)
  async on (events: TodoUncompletedEvent[]): Promise<void> {
    const integrationEvents: NatsPublisherEventWithSubject[] = []

    for (const event of events) {
      const todoUuid = event.content.uuid
      const integrationEvent = new TodoUncompletedIntegrationEvent(todoUuid)
      const onSubject = natsSubject(TodoUncompletedNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        uuid: todoUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publish(integrationEvents)
  }
}
