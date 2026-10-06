import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { ContactEvent } from '#src/app/contact/events/contact-event.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

export class ContactCreatedEventContent {
  constructor (readonly uuid: ContactUuid) {}
}

@RegisterDomainEvent(DomainEventType.CONTACT_CREATED, 1)
export class ContactCreatedEvent
  extends ContactEvent<ContactCreatedEventContent> {
  constructor (contact: Contact) {
    super({
      contactUuid: contact.uuid,
      content: new ContactCreatedEventContent(contact.uuid)
    })
  }
}
