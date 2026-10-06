import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import dayjs from 'dayjs'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

export interface SyncTypesenseJobData {
  collectionName: TypesenseCollectionName
}

@PgBossJob(QueueName.SYSTEM)
export class SyncTypesenseJob extends BaseJob<SyncTypesenseJobData> {
  private static readonly DELAY_IN_SECONDS = 2

  constructor (collectionName: TypesenseCollectionName) {
    const startAfter = dayjs().add(SyncTypesenseJob.DELAY_IN_SECONDS, 'seconds').toDate()

    super({ collectionName }, {
      singletonKey: `sync-typesense-${collectionName}`,
      startAfter
    })
  }
}
