import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

export interface AddNewNotificationTypeToPreferencesJobData {
  type: NotificationType
  isNewCategory: boolean
}

@PgBossJob(QueueName.SYSTEM)
export class AddNewNotificationTypeToPreferencesJob
  extends BaseJob<AddNewNotificationTypeToPreferencesJobData> {
  constructor (type: NotificationType, isNewCategory: boolean) {
    super({ type, isNewCategory })
  }
}
