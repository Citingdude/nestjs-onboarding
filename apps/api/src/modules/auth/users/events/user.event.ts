import { DomainEvent, type SubjectedEventOptions } from '@wisemen/nestjs-domain-events'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class UserEvent<Content extends object> extends DomainEvent<Content> {
  constructor (options: SubjectedEventOptions<Content, { userUuid: UserUuid }>) {
    super({
      ...options,
      subjectId: options.userUuid,
      subjectType: DomainEventSubjectType.USER
    })
  }
}
