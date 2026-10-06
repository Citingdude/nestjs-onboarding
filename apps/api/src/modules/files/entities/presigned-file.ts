import type { FileUuid } from './file.uuid.js'
import type { PresignedFileVariant } from './presigned-file-variant.type.js'
import type { MimeType } from '#src/modules/files/enums/mime-type.enum.js'

export class PresignedFile {
  uuid: FileUuid
  name: string
  mimeType: MimeType | null
  url: string
  blurHash: string | null
  variants: PresignedFileVariant[]
}
