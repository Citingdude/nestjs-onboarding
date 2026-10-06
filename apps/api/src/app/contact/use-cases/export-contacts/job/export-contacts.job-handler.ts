import { Injectable } from '@nestjs/common'
import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { ExportContactsJob, type ExportContactsJobData } from './export-contacts.job.js'
import { ExportContactsJobUseCase } from './export-contacts.job-use-case.js'

@Injectable()
@PgBossJobHandler(ExportContactsJob)
export class ExportContactsJobHandler extends JobHandler<ExportContactsJob> {
  constructor (
    private useCase: ExportContactsJobUseCase
  ) {
    super()
  }

  async run (jobData: ExportContactsJobData): Promise<void> {
    await this.useCase.execute(jobData)
  }
}
