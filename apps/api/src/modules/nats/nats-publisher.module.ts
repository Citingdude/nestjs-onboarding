import { Module } from '@nestjs/common'
import { NatsPublisherModule } from '@wisemen/nestjs-nats'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

@Module({
  imports: [
    NatsPublisherModule.forRootAsync({
      imports: [DefaultPgBossSchedulerModule],
      inject: [PgBossScheduler],
      useFactory: (scheduler: PgBossScheduler) => ({
        scheduler,
        queueName: QueueName.NATS_OUTBOX
      })
    })
  ],
  exports: [NatsPublisherModule]
})
export class DefaultNatsPublisherModule {}
