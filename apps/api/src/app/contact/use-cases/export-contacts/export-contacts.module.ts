import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ExportContactsController } from './export-contacts.controller.js'
import { ExportContactsUseCase } from './export-contacts.use-case.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'
import { Export } from '#src/app/export/entities/export.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Export]),
    DefaultPgBossSchedulerModule
  ],
  controllers: [
    ExportContactsController
  ],
  providers: [
    ExportContactsUseCase
  ]
})
export class ExportContactsModule {}
