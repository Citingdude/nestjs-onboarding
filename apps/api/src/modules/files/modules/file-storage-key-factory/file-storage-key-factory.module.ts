import { Module } from '@nestjs/common'
import { FileStorageKeyFactory } from './file-storage-key-factory.js'

@Module({
  providers: [FileStorageKeyFactory],
  exports: [FileStorageKeyFactory]
})
export class FileStorageKeyFactoryModule {}
