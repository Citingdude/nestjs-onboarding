import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

@PgBossJob(QueueName.SYSTEM)
export class SyncFeatureFlagConfigJob extends BaseJob {
  constructor () {
    super({}, { singletonKey: 'sync-feature-flag-config-job' })
  }
}
