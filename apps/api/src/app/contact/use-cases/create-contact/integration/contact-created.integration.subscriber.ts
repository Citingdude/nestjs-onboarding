import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NatsPublisher, natsSubject, type NatsPublisherStreamEventWithSubject } from '@wisemen/nestjs-nats'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { ContactCreatedIntegrationEvent, ContactCreatedNatsSubject } from './contact-created.integration.event.js'
import { ContactCreatedEvent } from '#src/app/contact/use-cases/create-contact/contact-created.event.js'

@Injectable()
export class ContactCreatedIntegrationSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) {}

  @Subscribe(ContactCreatedEvent)
  async on (events: ContactCreatedEvent[]): Promise<void> {
    const integrationEvents: NatsPublisherStreamEventWithSubject[] = []

    for (const event of events) {
      const contactUuid = event.content.uuid
      const integrationEvent = new ContactCreatedIntegrationEvent(contactUuid)
      const onSubject = natsSubject(ContactCreatedNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        uuid: contactUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publishToStream(integrationEvents)
  }
}
