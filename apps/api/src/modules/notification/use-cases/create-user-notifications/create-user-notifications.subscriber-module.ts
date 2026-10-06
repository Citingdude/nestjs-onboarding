import { Module } from '@nestjs/common'
import { CreateUserNotificationsSubscriber } from './create-user-notifications.subscriber.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'

@Module({
  imports: [DefaultPgBossSchedulerModule],
  providers: [CreateUserNotificationsSubscriber]
})
export class CreateUserNotificationsSubscriberModule {}
