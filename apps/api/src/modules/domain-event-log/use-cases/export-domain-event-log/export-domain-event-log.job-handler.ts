import { Injectable } from '@nestjs/common'
import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { ExportDomainEventLogJob, type ExportDomainEventLogJobData } from './export-domain-event-log.job.js'
import { ExportDomainEventLogJobUseCase } from './export-domain-event-log.job-use-case.js'

@Injectable()
@PgBossJobHandler(ExportDomainEventLogJob)
export class ExportDomainEventLogJobHandler extends JobHandler<ExportDomainEventLogJob> {
  constructor (
    private useCase: ExportDomainEventLogJobUseCase
  ) {
    super()
  }

  async run (jobData: ExportDomainEventLogJobData): Promise<void> {
    await this.useCase.execute(jobData)
  }
}
