import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NatsPublisher, natsSubject, type NatsPublisherStreamEventWithSubject } from '@wisemen/nestjs-nats'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { ContactUpdatedIntegrationEvent, ContactUpdatedNatsSubject } from './contact-updated.integration.event.js'
import { ContactUpdatedEvent } from '#src/app/contact/use-cases/update-contact/contact-updated.event.js'

@Injectable()
export class ContactUpdatedIntegrationSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) {}

  @Subscribe(ContactUpdatedEvent)
  async on (events: ContactUpdatedEvent[]): Promise<void> {
    const integrationEvents: NatsPublisherStreamEventWithSubject[] = []

    for (const event of events) {
      const contactUuid = event.content.contactUuid
      const integrationEvent = new ContactUpdatedIntegrationEvent(contactUuid)
      const onSubject = natsSubject(ContactUpdatedNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        uuid: contactUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publishToStream(integrationEvents)
  }
}
