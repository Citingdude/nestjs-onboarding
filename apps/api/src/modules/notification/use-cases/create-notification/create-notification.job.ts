import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export interface CreateNotificationJobData {
  createdByUserUuid: UserUuid | null
  type: NotificationType
  meta: Record<string, unknown>
}

@PgBossJob(QueueName.SYSTEM)
export class CreateNotificationJob extends BaseJob<CreateNotificationJobData> {
  constructor (notification: CreateNotificationJobData) {
    super(notification)
  }
}
