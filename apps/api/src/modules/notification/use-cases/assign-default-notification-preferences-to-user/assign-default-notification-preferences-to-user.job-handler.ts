import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { Injectable } from '@nestjs/common'
import { AssignDefaultNotificationPreferencesToUserUseCase } from './assign-default-notification-preferences-to-user.use-case.js'
import { AssignDefaultNotificationPreferencesToUserJob, type AssignDefaultNotificationPreferencesToUserJobData } from './assign-default-notification-preferences-to-user.job.js'

@Injectable()
@PgBossJobHandler(AssignDefaultNotificationPreferencesToUserJob)
export class AssignDefaultNotificationPreferencesToUserJobHandler
  extends JobHandler<AssignDefaultNotificationPreferencesToUserJob> {
  constructor (
    private readonly useCase: AssignDefaultNotificationPreferencesToUserUseCase
  ) {
    super()
  }

  async run ({ userUuid }: AssignDefaultNotificationPreferencesToUserJobData): Promise<void> {
    await this.useCase.assignDefaultPreferences(userUuid)
  }
}
