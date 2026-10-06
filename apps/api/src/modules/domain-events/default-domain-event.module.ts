import { Global, Module } from '@nestjs/common'
import { DomainEventEmitterModule, type DomainEventEmitFunction } from '@wisemen/nestjs-domain-events'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { DomainEventSubscribersModule } from '#src/modules/domain-events/domain-event-subscribers.module.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'
import { DomainEventLogContextModule } from '#src/modules/domain-event-log/modules/domain-event-log-context/domain-event-log.context.module.js'
import { DomainEventLogContext } from '#src/modules/domain-event-log/modules/domain-event-log-context/domain-event-log.context.js'

@Global()
@Module({
  imports: [
    DomainEventEmitterModule.forRootAsync({
      imports: [
        DefaultPgBossSchedulerModule,
        DomainEventLogContextModule,
        DomainEventSubscribersModule
      ],
      inject: [PgBossScheduler, DomainEventLogContext],
      useFactory: (scheduler: PgBossScheduler, logCtx: DomainEventLogContext) => {
        return {
          middleware: async (emit: DomainEventEmitFunction) => {
            const scheduleCb = async () => await scheduler.runAndCaptureJobs(emit)
            await logCtx.runAndCaptureLogs(scheduleCb)
          }
        }
      }
    })
  ],
  exports: [DomainEventEmitterModule]
})
export class DefaultDomainEventModule {}
