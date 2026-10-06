import { JobHandler, PgBossJobHandler } from '@wisemen/pgboss-nestjs-job'
import { Injectable } from '@nestjs/common'
import { AddNewNotificationTypeToPreferencesUseCase } from './add-new-notification-type-to-preferences.use-case.js'
import { AddNewNotificationTypeToPreferencesJob, type AddNewNotificationTypeToPreferencesJobData } from './add-new-notification-type-to-preferences.job.js'

@Injectable()
@PgBossJobHandler(AddNewNotificationTypeToPreferencesJob)
export class AddNewNotificationTypeToPreferencesJobHandler
  extends JobHandler<AddNewNotificationTypeToPreferencesJob> {
  constructor (
    private readonly useCase: AddNewNotificationTypeToPreferencesUseCase
  ) {
    super()
  }

  async run (data: AddNewNotificationTypeToPreferencesJobData): Promise<void> {
    await this.useCase.execute(data.type, data.isNewCategory)
  }
}
