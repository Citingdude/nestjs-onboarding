import { Injectable } from '@nestjs/common'
import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { MigrateCollectionsJob } from './migrate-collections.job.js'
import { MigrateCollectionsUseCase } from '#src/modules/typesense/use-cases/migrate-collections/migrate-collections.use-case.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

@Injectable()
@PgBossJobHandler(MigrateCollectionsJob)
export class MigrateCollectionsHandler extends JobHandler<MigrateCollectionsJob> {
  constructor (
    private readonly useCase: MigrateCollectionsUseCase
  ) {
    super()
  }

  async run (): Promise<void> {
    await this.useCase.execute(false, Object.values(TypesenseCollectionName))
  }
}
