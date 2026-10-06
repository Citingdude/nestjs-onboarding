import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import { ExportEvent } from '#src/app/export/events/export.event.js'

export class ExportSucceededEventContent {
  constructor (
    readonly exportUuid: ExportUuid,
    readonly fileUuid: FileUuid,
    readonly requestedByUserUuid: UserUuid
  ) {}
}

@RegisterDomainEvent(DomainEventType.EXPORT_SUCCEEDED, 1)
export class ExportSucceededEvent extends ExportEvent<ExportSucceededEventContent> {
  constructor (
    exportUuid: ExportUuid,
    fileUuid: FileUuid,
    requestedByUserUuid: UserUuid
  ) {
    super({
      exportUuid,
      content: new ExportSucceededEventContent(exportUuid, fileUuid, requestedByUserUuid)
    })
  }
}
