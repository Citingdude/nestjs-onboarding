import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export interface AssignDefaultNotificationPreferencesToUserJobData {
  userUuid: UserUuid
}

@PgBossJob(QueueName.SYSTEM)
export class AssignDefaultNotificationPreferencesToUserJob
  extends BaseJob<AssignDefaultNotificationPreferencesToUserJobData> {
  constructor (userUuid: UserUuid) {
    super({ userUuid }, { singletonKey: `assign-default-notification-preferences-to-${userUuid}` })
  }
}
