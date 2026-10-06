import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ArchiveDomainEventLogsRepository } from './archive-domain-event-logs.repository.js'
import { ArchiveDomainEventLogsUseCase } from './archive-domain-event-logs.use-case.js'
import { DomainEventLogArchive } from '#src/modules/domain-event-log/domain-event-log-archive.entity.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { DefaultFileStorageModule } from '#src/modules/files/default-file-storage.module.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { FileStorageKeyFactoryModule } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([DomainEventLog, DomainEventLogArchive, File]),
    DefaultFileStorageModule,
    FileStorageKeyFactoryModule
  ],
  providers: [
    ArchiveDomainEventLogsRepository,
    ArchiveDomainEventLogsUseCase
  ],
  exports: [
    ArchiveDomainEventLogsUseCase
  ]
})
export class ArchiveDomainEventLogsModule {}
