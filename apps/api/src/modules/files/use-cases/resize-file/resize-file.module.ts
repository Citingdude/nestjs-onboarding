import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { File } from '#src/modules/files/entities/file.entity.js'
import { ResizeFileUseCase } from '#src/modules/files/use-cases/resize-file/resize-file.use-case.js'
import { ResizeFileRepository } from '#src/modules/files/use-cases/resize-file/resize-file.repository.js'
import { ImageResizerModule } from '#src/modules/image-resize/image-resizer.module.js'
import { DefaultFileStorageModule } from '#src/modules/files/default-file-storage.module.js'
import { FileStorageKeyFactoryModule } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    FileStorageKeyFactoryModule,
    DefaultFileStorageModule,
    ImageResizerModule
  ],
  providers: [ResizeFileUseCase, ResizeFileRepository],
  exports: [ResizeFileUseCase]
})
export class ResizeFileModule {}
