import { ApiProperty } from '@nestjs/swagger'
import { MimeType, MimeTypeApiProperty } from '#src/modules/files/enums/mime-type.enum.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class FileResponse {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: FileUuid

  @ApiProperty({ type: 'string' })
  name: string

  @MimeTypeApiProperty()
  mimeType: MimeType

  @ApiProperty({ type: 'string', nullable: true })
  blurHash: string | null

  constructor (file: File) {
    this.uuid = file.uuid
    this.name = file.name
    this.mimeType = file.mimeType
    this.blurHash = file.blurHash
  }
}
