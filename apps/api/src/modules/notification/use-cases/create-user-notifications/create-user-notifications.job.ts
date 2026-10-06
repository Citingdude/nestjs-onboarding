import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'

export interface CreateUserNotificationsJobData {
  notificationUuid: NotificationUuid
}

@PgBossJob(QueueName.SYSTEM)
export class CreateUserNotificationsJob extends BaseJob<CreateUserNotificationsJobData> {
  constructor (notificationUuid: NotificationUuid) {
    super({ notificationUuid })
  }
}
