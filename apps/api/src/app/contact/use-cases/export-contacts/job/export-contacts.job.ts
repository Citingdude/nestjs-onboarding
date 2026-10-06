import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

export interface ExportContactsJobData {
  requestedByUserUuid: UserUuid
  exportUuid: ExportUuid
}

@PgBossJob(QueueName.SYSTEM)
export class ExportContactsJob extends BaseJob<ExportContactsJobData> {
  constructor (data: ExportContactsJobData) {
    super(data, { singletonKey: `export-contacts-${data.exportUuid}` })
  }
}
