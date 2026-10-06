import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export interface SyncUserFromZitadelJobData {
  userUuid: UserUuid
}

@PgBossJob(QueueName.SYSTEM)
export class SyncUserFromZitadelJob extends BaseJob<SyncUserFromZitadelJobData> {
  constructor (userUuid: UserUuid) {
    super({ userUuid }, { singletonKey: `sync-user-from-zitadel-${userUuid}` })
  }
}
