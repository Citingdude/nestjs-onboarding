import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewDomainEventLogIndexUseCase } from './view-domain-event-log-index.use-case.js'
import { ViewDomainEventLogIndexController } from './view-domain-event-log-index.controller.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([DomainEventLog])
  ],
  controllers: [ViewDomainEventLogIndexController],
  providers: [
    ViewDomainEventLogIndexUseCase
  ]
})
export class ViewDomainEventLogIndexModule {}
