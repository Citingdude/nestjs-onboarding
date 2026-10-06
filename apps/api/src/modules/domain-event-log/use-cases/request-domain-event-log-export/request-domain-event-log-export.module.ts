import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { RequestDomainEventLogExportController } from './request-domain-event-log-export.controller.js'
import { RequestDomainEventLogExportUseCase } from './request-domain-event-log-export.use-case.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Export]),
    DefaultPgBossSchedulerModule
  ],
  controllers: [
    RequestDomainEventLogExportController
  ],
  providers: [
    RequestDomainEventLogExportUseCase
  ]
})
export class RequestDomainEventLogExportModule {}
