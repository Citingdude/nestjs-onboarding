import { Module } from '@nestjs/common'
import { DomainEventLogActorContext } from './domain-event-log-actor.context.js'

@Module({
  providers: [DomainEventLogActorContext],
  exports: [DomainEventLogActorContext]
})
export class DomainEventLogActorContextModule {}
