import { Injectable } from '@nestjs/common'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { SyncUserFromZitadelJob } from './sync-user-from-zitadel.job.js'
import { UserCreatedEvent } from '#src/modules/auth/users/use-cases/get-or-create-user/user-created.event.js'

@Injectable()
export class SyncUserFromZitadelSubscriber {
  constructor (
    private readonly jobScheduler: PgBossScheduler
  ) {}

  @Subscribe(UserCreatedEvent)
  async on (events: UserCreatedEvent[]): Promise<void> {
    const jobs = events.map(event => new SyncUserFromZitadelJob(event.content.userUuid))

    await this.jobScheduler.scheduleJobs(jobs)
  }
}
