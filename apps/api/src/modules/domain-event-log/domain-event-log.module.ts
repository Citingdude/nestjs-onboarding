import { Module } from '@nestjs/common'
import { ViewDomainEventLogIndexModule } from './use-cases/view-event-log-index/view-domain-event-log-index.module.js'
import { RequestDomainEventLogExportModule } from '#src/modules/domain-event-log/use-cases/request-domain-event-log-export/request-domain-event-log-export.module.js'

@Module({
  imports: [
    ViewDomainEventLogIndexModule,
    RequestDomainEventLogExportModule
  ]
})
export class DomainEventLogModule {}
