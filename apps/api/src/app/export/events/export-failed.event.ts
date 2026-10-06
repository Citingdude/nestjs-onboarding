import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { ExportEvent } from '#src/app/export/events/export.event.js'

export class ExportFailedEventContent {
  constructor (
    readonly exportUuid: ExportUuid,
    readonly requestedByUserUuid: UserUuid,
    readonly errorMessage: string
  ) {}
}

@RegisterDomainEvent(DomainEventType.EXPORT_FAILED, 1)
export class ExportFailedEvent extends ExportEvent<ExportFailedEventContent> {
  constructor (
    exportUuid: ExportUuid,
    requestedByUserUuid: UserUuid,
    errorMessage: string
  ) {
    super({
      exportUuid,
      content: new ExportFailedEventContent(exportUuid, requestedByUserUuid, errorMessage)
    })
  }
}
