import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { FileEvent } from '#src/modules/files/events/file.event.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class FileUploadedEventContent {
  readonly fileUuid: FileUuid
  readonly fileName: string
  readonly blurHash: string | null

  constructor (file: File) {
    this.fileUuid = file.uuid
    this.fileName = file.name
    this.blurHash = file.blurHash
  }
}

@RegisterDomainEvent(DomainEventType.FILE_UPLOADED, 1)
export class FileUploadedEvent extends FileEvent<FileUploadedEventContent> {
  constructor (file: File) {
    super({
      fileUuid: file.uuid,
      content: new FileUploadedEventContent(file)
    })
  }
}
