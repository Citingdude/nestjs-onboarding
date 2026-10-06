import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { ContactEvent } from '#src/app/contact/events/contact-event.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

export class ContactUpdatedEventContent {
  constructor (readonly contactUuid: ContactUuid) {}
}

@RegisterDomainEvent(DomainEventType.CONTACT_UPDATED, 1)
export class ContactUpdatedEvent
  extends ContactEvent<ContactUpdatedEventContent> {
  constructor (contactUuid: ContactUuid) {
    super({
      contactUuid,
      content: new ContactUpdatedEventContent(contactUuid)
    })
  }
}
