import { DomainEvent, type SubjectedEventOptions } from '@wisemen/nestjs-domain-events'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'

export class ExportEvent<Content extends object> extends DomainEvent<Content> {
  constructor (options: SubjectedEventOptions<Content, { exportUuid: ExportUuid }>) {
    super({
      ...options,
      subjectId: options.exportUuid,
      subjectType: DomainEventSubjectType.EXPORT
    })
  }
}
