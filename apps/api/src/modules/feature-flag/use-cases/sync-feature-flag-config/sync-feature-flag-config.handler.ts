import { Injectable } from '@nestjs/common'
import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { SyncFeatureFlagConfigJob } from './sync-feature-flag-config.job.js'
import { SyncFeatureFlagConfigUseCase } from './sync-feature-flag-config.use-case.js'

@Injectable()
@PgBossJobHandler(SyncFeatureFlagConfigJob)
export class SyncFeatureFlagConfigJobHandler
  extends JobHandler<SyncFeatureFlagConfigJob> {
  constructor (
    private readonly useCase: SyncFeatureFlagConfigUseCase
  ) {
    super()
  }

  async run (): Promise<void> {
    await this.useCase.execute()
  }
}
