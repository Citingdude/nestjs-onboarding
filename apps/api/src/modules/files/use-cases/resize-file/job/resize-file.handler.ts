import { JobHandler } from '@wisemen/pgboss-nestjs-job'
import type { ResizeFileJob, ResizeFileJobData, ResizeFileVariant } from '#src/modules/files/use-cases/resize-file/job/resize-file.job.js'
import type { ResizeFileUseCase } from '#src/modules/files/use-cases/resize-file/resize-file.use-case.js'

export class ResizeFileJobHandler extends JobHandler<ResizeFileJob> {
  constructor (
    private readonly useCase: ResizeFileUseCase
  ) {
    super()
  }

  async run (data: ResizeFileJobData): Promise<void> {
    const variants = JSON.parse(data.variants) as ResizeFileVariant[]
    await this.useCase.execute(data.fileUuid, variants)
  }
}
