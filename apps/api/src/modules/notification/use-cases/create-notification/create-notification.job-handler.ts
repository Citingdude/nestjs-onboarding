import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { Injectable } from '@nestjs/common'
import { CreateNotificationUseCase } from './create-notification.use-case.js'
import { CreateNotificationJob, type CreateNotificationJobData } from './create-notification.job.js'

@Injectable()
@PgBossJobHandler(CreateNotificationJob)
export class CreateNotificationJobHandler extends JobHandler<CreateNotificationJob> {
  constructor (
    private readonly useCase: CreateNotificationUseCase
  ) {
    super()
  }

  async run (data: CreateNotificationJobData): Promise<void> {
    await this.useCase.createNotification(data.createdByUserUuid, data.type, data.meta)
  }
}
