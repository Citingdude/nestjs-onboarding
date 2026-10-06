import { Module } from '@nestjs/common'
import { AssignDefaultNotificationPreferencesToUserSubscriber } from './assign-default-notification-preferences-to-user.subscriber.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'

@Module({
  imports: [DefaultPgBossSchedulerModule],
  providers: [AssignDefaultNotificationPreferencesToUserSubscriber]
})
export class AssignDefaultNotificationPreferencesToUserSubscriberModule {}
