import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

@PgBossJob(QueueName.SYSTEM)
export class MigrateCollectionsJob extends BaseJob {
  constructor () {
    super({}, {
      singletonKey: 'migrate-typesense-collections'
    })
  }
}
