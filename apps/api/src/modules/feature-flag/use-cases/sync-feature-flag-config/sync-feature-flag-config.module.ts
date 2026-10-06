import { Module, type OnApplicationBootstrap } from '@nestjs/common'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'
import { SyncFeatureFlagConfigJob } from '#src/modules/feature-flag/use-cases/sync-feature-flag-config/sync-feature-flag-config.job.js'

@Module({
  imports: [DefaultPgBossSchedulerModule]
})
export class SyncFeatureFlagConfigModule implements OnApplicationBootstrap {
  constructor (
    private jobScheduler: PgBossScheduler
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const job = new SyncFeatureFlagConfigJob()
    await this.jobScheduler.scheduleJob(job)
  }
}
