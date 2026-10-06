import { Module } from '@nestjs/common'
import { ResizeFileModule } from '#src/modules/files/use-cases/resize-file/resize-file.module.js'
import { ResizeFileJobHandler } from '#src/modules/files/use-cases/resize-file/job/resize-file.handler.js'

@Module({
  imports: [ResizeFileModule],
  providers: [ResizeFileJobHandler]
})
export class ResizeFileJobModule {}
