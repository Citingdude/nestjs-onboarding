import { Module } from '@nestjs/common'
import { ImageResizer } from '#src/modules/image-resize/image-resizer.js'

@Module({
  providers: [ImageResizer],
  exports: [ImageResizer]
})
export class ImageResizerModule { }
