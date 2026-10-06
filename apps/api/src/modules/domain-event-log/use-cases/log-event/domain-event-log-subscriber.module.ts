import { Module } from '@nestjs/common'
import { DomainEventLogSubscriber } from './domain-event-log.subscriber.js'
import { DomainEventLogContextModule } from '#src/modules/domain-event-log/modules/domain-event-log-context/domain-event-log.context.module.js'
import { DomainEventLogActorContextModule } from '#src/modules/domain-event-log/modules/domain-event-log-actor-context/domain-event-log-actor.context.module.js'

@Module({
  imports: [
    DomainEventLogActorContextModule,
    DomainEventLogContextModule
  ],
  providers: [DomainEventLogSubscriber]
})
export class DomainEventLogSubscriberModule {}
