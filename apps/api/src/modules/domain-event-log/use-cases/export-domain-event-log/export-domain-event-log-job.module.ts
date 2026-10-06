import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ExportDomainEventLogJobHandler } from './export-domain-event-log.job-handler.js'
import { ExportDomainEventLogJobRepository } from './export-domain-event-log-job.repository.js'
import { ExportDomainEventLogJobUseCase } from './export-domain-event-log.job-use-case.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { DefaultFileStorageModule } from '#src/modules/files/default-file-storage.module.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { FileStorageKeyFactoryModule } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([DomainEventLog, Export, File, UserPreferences]),
    DefaultFileStorageModule,
    FileStorageKeyFactoryModule
  ],
  providers: [
    ExportDomainEventLogJobHandler,
    ExportDomainEventLogJobUseCase,
    ExportDomainEventLogJobRepository
  ]
})
export class ExportDomainEventLogJobModule {}
