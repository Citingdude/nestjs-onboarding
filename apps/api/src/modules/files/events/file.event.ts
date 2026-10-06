import { DomainEvent, type SubjectedEventOptions } from '@wisemen/nestjs-domain-events'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class FileEvent<Content extends object> extends DomainEvent<Content> {
  constructor (options: SubjectedEventOptions<Content, { fileUuid: FileUuid }>) {
    super({
      ...options,
      subjectId: options.fileUuid,
      subjectType: DomainEventSubjectType.FILE
    })
  }
}
