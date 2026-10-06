import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ConfirmFileUploadController } from './confirm-file-upload.controller.js'
import { ConfirmFileUploadUseCase } from './confirm-file-upload.use-case.js'
import { File } from '#src/modules/files/entities/file.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([File])
  ],
  controllers: [
    ConfirmFileUploadController
  ],
  providers: [
    ConfirmFileUploadUseCase
  ]
})
export class ConfirmFileUploadV2Module {}
