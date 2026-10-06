import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { DomainEventLogContext } from './domain-event-log.context.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'

@Module({
  imports: [TypeOrmModule.forFeature([DomainEventLog])],
  providers: [DomainEventLogContext],
  exports: [DomainEventLogContext]
})
export class DomainEventLogContextModule {}
