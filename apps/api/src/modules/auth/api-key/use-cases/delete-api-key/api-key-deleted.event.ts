import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { ApiKeyEvent } from '#src/modules/auth/api-key/events/api-key.event.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'

export class ApiKeyDeletedEventContent {
  constructor (readonly apiKeyUuid: ApiKeyUuid) {}
}

@RegisterDomainEvent(DomainEventType.API_KEY_DELETED, 1)
export class ApiKeyDeletedEvent
  extends ApiKeyEvent<ApiKeyDeletedEventContent> {
  constructor (apiKeyUuid: ApiKeyUuid) {
    super({
      apiKeyUuid,
      content: new ApiKeyDeletedEventContent(apiKeyUuid)
    })
  }
}
