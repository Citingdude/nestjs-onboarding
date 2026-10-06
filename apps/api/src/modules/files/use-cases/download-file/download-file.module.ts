import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { DownloadFileController } from './download-file.controller.js'
import { DownloadFileUseCase } from './download-file.use-case.js'
import { FilePresignerModule } from '#src/modules/files/modules/file-presigner/file-presigner.module.js'
import { File } from '#src/modules/files/entities/file.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    FilePresignerModule
  ],
  controllers: [DownloadFileController],
  providers: [DownloadFileUseCase]
})
export class DownloadFileModule {}
