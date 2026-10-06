import { DomainEvent, type SubjectedEventOptions } from '@wisemen/nestjs-domain-events'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

export class ContactEvent<Content extends object> extends DomainEvent<Content> {
  constructor (options: SubjectedEventOptions<Content, { contactUuid: ContactUuid }>) {
    super({
      ...options,
      subjectId: options.contactUuid,
      subjectType: DomainEventSubjectType.CONTACT
    })
  }
}
