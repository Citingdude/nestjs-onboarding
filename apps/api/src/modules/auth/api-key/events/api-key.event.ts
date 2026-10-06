import { DomainEvent, type SubjectedEventOptions } from '@wisemen/nestjs-domain-events'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'

export class ApiKeyEvent<Content extends object> extends DomainEvent<Content> {
  constructor (options: SubjectedEventOptions<Content, { apiKeyUuid: ApiKeyUuid }>) {
    super({
      ...options,
      subjectId: options.apiKeyUuid,
      subjectType: DomainEventSubjectType.API_KEY
    })
  }
}
