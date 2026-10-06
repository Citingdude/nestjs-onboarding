import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NatsPublisher, natsSubject, type NatsPublisherStreamEventWithSubject } from '@wisemen/nestjs-nats'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { ContactDeletedIntegrationEvent, ContactDeletedNatsSubject } from './contact-deleted.integration.event.js'
import { ContactDeletedEvent } from '#src/app/contact/use-cases/delete-contact/contact-deleted.event.js'

@Injectable()
export class ContactDeletedIntegrationSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) {}

  @Subscribe(ContactDeletedEvent)
  async on (events: ContactDeletedEvent[]): Promise<void> {
    const integrationEvents: NatsPublisherStreamEventWithSubject[] = []

    for (const event of events) {
      const contactUuid = event.content.uuid
      const integrationEvent = new ContactDeletedIntegrationEvent(contactUuid)
      const onSubject = natsSubject(ContactDeletedNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        uuid: contactUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publishToStream(integrationEvents)
  }
}
