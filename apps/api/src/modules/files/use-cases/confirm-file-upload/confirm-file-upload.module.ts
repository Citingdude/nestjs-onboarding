import { Module } from '@nestjs/common'
import { ConfirmFileUploadV1Module } from './v1/confirm-file-upload.module.js'
import { ConfirmFileUploadV2Module } from './v2/confirm-file-upload.module.js'

@Module({
  imports: [
    ConfirmFileUploadV1Module,
    ConfirmFileUploadV2Module
  ]
})
export class ConfirmFileUploadModule {}
