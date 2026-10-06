import { Module } from '@nestjs/common'
import { FilePresigner } from './file-presigner.js'
import { FileStorageKeyFactoryModule } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.module.js'
import { DefaultFileStorageModule } from '#src/modules/files/default-file-storage.module.js'

@Module({
  imports: [
    DefaultFileStorageModule,
    FileStorageKeyFactoryModule
  ],
  providers: [FilePresigner],
  exports: [FilePresigner]
})
export class FilePresignerModule {}
