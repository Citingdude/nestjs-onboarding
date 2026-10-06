import { Module } from '@nestjs/common'
import { UserTypesenseSubscriber } from './user-typesense.subscriber.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'

@Module({
  imports: [DefaultPgBossSchedulerModule],
  providers: [UserTypesenseSubscriber]
})
export class UserTypesenseSubscriberModule {}
