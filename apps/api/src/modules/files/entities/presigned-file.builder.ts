import { randomUUID } from 'node:crypto'
import { generateUuid } from '@wisemen/nestjs-common'
import { PresignedFile } from './presigned-file.js'
import type { File } from './file.entity.js'
import type { PresignedFileVariant } from './presigned-file-variant.type.js'
import type { FileUuid } from './file.uuid.js'
import type { MimeType } from '#src/modules/files/enums/mime-type.enum.js'

export class PresignedFileBuilder {
  private file: PresignedFile

  constructor () {
    this.file = new PresignedFile()
    this.file.uuid = generateUuid()
    this.file.name = randomUUID()
    this.file.mimeType = null
    this.file.url = ''
    this.file.blurHash = null
    this.file.variants = []
  }

  withUuid (uuid: FileUuid): this {
    this.file.uuid = uuid
    return this
  }

  withName (name: string): this {
    this.file.name = name
    return this
  }

  withMimeType (type: MimeType | null): this {
    this.file.mimeType = type
    return this
  }

  withUrl (url: string): this {
    this.file.url = url
    return this
  }

  withBlurHash (blurHash: string | null): this {
    this.file.blurHash = blurHash
    return this
  }

  withVariants (variants: PresignedFileVariant[]): this {
    this.file.variants = variants
    return this
  }

  addVariant (variant: PresignedFileVariant): this {
    this.file.variants.push(variant)
    return this
  }

  withFile (file: File): this {
    return this.withUuid(file.uuid)
      .withName(file.name)
      .withMimeType(file.mimeType)
      .withBlurHash(file.blurHash)
  }

  build (): PresignedFile {
    return this.file
  }
}
