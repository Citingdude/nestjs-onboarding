import { randomUUID } from 'node:crypto'
import { generateUuid } from '@wisemen/nestjs-common'
import { File } from './file.entity.js'
import type { FileUuid } from './file.uuid.js'
import { MimeType } from '#src/modules/files/enums/mime-type.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { FileVariant } from '#src/modules/files/entities/file-variant.type.js'

export class FileBuilder {
  private file: File

  constructor () {
    this.file = new File()

    this.file.uuid = generateUuid()
    this.file.name = randomUUID()
    this.file.key = randomUUID()
    this.file.mimeType = MimeType.OCTET_STREAM
    this.file.isUploadConfirmed = false
    this.file.blurHash = null
    this.file.variants = []
    this.file.createdAt = new Date()
    this.file.updatedAt = new Date()
    this.file.uploaderUuid = null
    this.file.isPublic = false
  }

  withUuid (uuid: FileUuid): this {
    this.file.uuid = uuid
    return this
  }

  withName (name: string): this {
    this.file.name = name
    return this
  }

  withMimeType (mimeType: MimeType): this {
    this.file.mimeType = mimeType
    return this
  }

  withUploaderUuid (uuid: UserUuid | null): this {
    this.file.uploaderUuid = uuid
    return this
  }

  withIsPublic (isPublic?: boolean): this {
    this.file.isPublic = isPublic ?? false
    return this
  }

  withVariants (variants: FileVariant[]): this {
    this.file.variants = variants
    return this
  }

  build (): File {
    return this.file
  }
}
