import { DomainEvent, type SubjectedEventOptions } from '@wisemen/nestjs-domain-events'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class RoleEvent<Content extends object> extends DomainEvent<Content> {
  constructor (options: SubjectedEventOptions<Content, { roleUuid: RoleUuid }>) {
    super({
      ...options,
      subjectId: options.roleUuid,
      subjectType: DomainEventSubjectType.ROLE
    })
  }
}
