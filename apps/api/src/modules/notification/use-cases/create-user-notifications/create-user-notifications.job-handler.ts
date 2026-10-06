import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { Injectable } from '@nestjs/common'
import { CreateUserNotificationsJob, type CreateUserNotificationsJobData } from './create-user-notifications.job.js'
import { CreateUserNotificationsUseCase } from './create-user-notifications.use-case.js'

@Injectable()
@PgBossJobHandler(CreateUserNotificationsJob)
export class CreateUserNotificationsJobHandler extends JobHandler<CreateUserNotificationsJob> {
  constructor (
    private readonly useCase: CreateUserNotificationsUseCase
  ) {
    super()
  }

  async run ({ notificationUuid }: CreateUserNotificationsJobData): Promise<void> {
    await this.useCase.execute(notificationUuid)
  }
}
