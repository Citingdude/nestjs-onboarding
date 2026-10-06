import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { ContactEvent } from '#src/app/contact/events/contact-event.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

export class ContactDeletedEventContent {
  constructor (readonly uuid: ContactUuid) {}
}

@RegisterDomainEvent(DomainEventType.CONTACT_DELETED, 1)
export class ContactDeletedEvent
  extends ContactEvent<ContactDeletedEventContent> {
  constructor (contactUuid: ContactUuid) {
    super({
      contactUuid,
      content: new ContactDeletedEventContent(contactUuid)
    })
  }
}
