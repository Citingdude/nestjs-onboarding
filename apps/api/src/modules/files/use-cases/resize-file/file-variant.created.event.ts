import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { FileEvent } from '#src/modules/files/events/file.event.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class FileVariantCreatedEventContent {
  readonly fileUuid: FileUuid
  readonly variantLabel: string

  constructor (fileUuid: FileUuid, variantLabel: string) {
    this.fileUuid = fileUuid
    this.variantLabel = variantLabel
  }
}

@RegisterDomainEvent(DomainEventType.FILE_VARIANT_CREATED, 1)
export class FileVariantCreatedEvent extends FileEvent<FileVariantCreatedEventContent> {
  constructor (fileUuid: FileUuid, variantLabel: string) {
    super({
      fileUuid: fileUuid,
      content: new FileVariantCreatedEventContent(fileUuid, variantLabel)
    })
  }
}
