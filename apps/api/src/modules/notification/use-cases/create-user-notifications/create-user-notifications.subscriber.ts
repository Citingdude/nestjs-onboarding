import { Injectable } from '@nestjs/common'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { CreateUserNotificationsJob } from './create-user-notifications.job.js'
import { NotificationCreatedEvent } from '#src/modules/notification/use-cases/create-notification/notification-created.event.js'

@Injectable()
export class CreateUserNotificationsSubscriber {
  constructor (
    private readonly jobScheduler: PgBossScheduler
  ) {}

  @Subscribe(NotificationCreatedEvent)
  async on (events: NotificationCreatedEvent[]): Promise<void> {
    const jobs = events.map(event => new CreateUserNotificationsJob(event.content.uuid))
    await this.jobScheduler.scheduleJobs(jobs)
  }
}
