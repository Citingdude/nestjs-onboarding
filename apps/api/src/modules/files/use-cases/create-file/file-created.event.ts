import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { FileEvent } from '#src/modules/files/events/file.event.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class FileCreatedEventContent {
  readonly fileUuid: FileUuid
  readonly fileName: string

  constructor (file: File) {
    this.fileUuid = file.uuid
    this.fileName = file.name
  }
}

@RegisterDomainEvent(DomainEventType.FILE_CREATED, 1)
export class FileCreatedEvent extends FileEvent<FileCreatedEventContent> {
  constructor (file: File) {
    super({
      fileUuid: file.uuid,
      content: new FileCreatedEventContent(file)
    })
  }
}
