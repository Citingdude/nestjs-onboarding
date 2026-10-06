import { Module } from '@nestjs/common'
import { SyncUserFromZitadelSubscriber } from './sync-user-from-zitadel.subscriber.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'

@Module({
  imports: [DefaultPgBossSchedulerModule],
  providers: [SyncUserFromZitadelSubscriber]
})
export class SyncUserFromZitadelSubscriberModule {}
