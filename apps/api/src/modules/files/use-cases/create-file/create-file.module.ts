import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { CreateFileController } from './create-file.controller.js'
import { CreateFileUseCase } from './create-file.use-case.js'
import { FileStorageKeyFactoryModule } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.module.js'
import { DefaultFileStorageModule } from '#src/modules/files/default-file-storage.module.js'
import { File } from '#src/modules/files/entities/file.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    DefaultFileStorageModule,
    FileStorageKeyFactoryModule
  ],
  controllers: [CreateFileController],
  providers: [CreateFileUseCase]
})
export class CreateFileModule {}
