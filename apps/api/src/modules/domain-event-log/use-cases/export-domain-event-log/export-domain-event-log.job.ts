import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import type { MultiSelectFilter } from '@wisemen/scoped-filter/dist/multi-select/multi-select-filter.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { DomainEventLogSource } from '#src/modules/domain-event-log/domain-event-log-source.enum.js'
import type { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

export interface ExportDomainEventLogJobData {
  requestedByUserUuid: UserUuid
  exportUuid: ExportUuid
  subjectTypes?: MultiSelectFilter<DomainEventSubjectType>
  subjectId?: string
  actorTypes?: MultiSelectFilter<DomainEventActorType>
  actorIds?: MultiSelectFilter<string>
  source?: DomainEventLogSource
  inRange?: string
}

@PgBossJob(QueueName.SYSTEM)
export class ExportDomainEventLogJob extends BaseJob<ExportDomainEventLogJobData> {
  constructor (data: ExportDomainEventLogJobData) {
    super(data, { singletonKey: `export-domain-event-log-${data.exportUuid}` })
  }
}
