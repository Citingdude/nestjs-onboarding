import { Injectable } from '@nestjs/common'
import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import { SyncTypesenseJob, type SyncTypesenseJobData } from './sync-typesense-collection.job.js'
import { TypesenseSyncRepository } from './typesense-sync.repository.js'

@Injectable()
@PgBossJobHandler(SyncTypesenseJob)
export class SyncTypesenseHandler extends JobHandler<SyncTypesenseJob> {
  constructor (
    private syncRepository: TypesenseSyncRepository,
    private typesense: TypesenseClient
  ) {
    super()
  }

  async run (data: SyncTypesenseJobData): Promise<void> {
    const lastSyncedAt = await this.syncRepository.fetchLastSyncedAt(data.collectionName)

    const newSyncedAt = new Date()

    if (lastSyncedAt === null) {
      await this.typesense.import(data.collectionName)
    } else {
      await this.typesense.importChanged(data.collectionName, lastSyncedAt)
      await this.typesense.deleteRemoved(data.collectionName, lastSyncedAt)
    }

    await this.syncRepository.updateLastSyncedAt(data.collectionName, newSyncedAt)
  }
}
