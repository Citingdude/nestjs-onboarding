import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ExportContactsJobHandler } from './export-contacts.job-handler.js'
import { ExportContactsJobUseCase } from './export-contacts.job-use-case.js'
import { ExportContactsJobRepository } from './export-contacts-job.repository.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { DefaultFileStorageModule } from '#src/modules/files/default-file-storage.module.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { FileStorageKeyFactoryModule } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.module.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact, Export, File, UserPreferences]),
    DefaultFileStorageModule,
    FileStorageKeyFactoryModule
  ],
  providers: [
    ExportContactsJobHandler,
    ExportContactsJobUseCase,
    ExportContactsJobRepository
  ]
})
export class ExportContactsJobModule {}
