import { Injectable } from '@nestjs/common'
import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { SyncUserFromZitadelJob, type SyncUserFromZitadelJobData } from './sync-user-from-zitadel.job.js'
import { SyncUserFromZitadelUseCase } from './sync-user-from-zitadel.use-case.js'

@Injectable()
@PgBossJobHandler(SyncUserFromZitadelJob)
export class SyncUserFromZitadelJobHandler extends JobHandler<SyncUserFromZitadelJob> {
  constructor (
    private readonly useCase: SyncUserFromZitadelUseCase
  ) {
    super()
  }

  async run ({ userUuid }: SyncUserFromZitadelJobData): Promise<void> {
    await this.useCase.execute(userUuid)
  }
}
