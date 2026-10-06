import { Module } from '@nestjs/common'
import { ContactTypesenseSubscriber } from './contact.typesense-subscriber.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'

@Module({
  imports: [DefaultPgBossSchedulerModule],
  providers: [ContactTypesenseSubscriber]
})
export class ContactTypesenseSubscriberModule {}
