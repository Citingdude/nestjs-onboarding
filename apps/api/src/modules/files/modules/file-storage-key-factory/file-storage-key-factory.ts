import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { MimeType, MimeTypeSuffix } from '#src/modules/files/enums/mime-type.enum.js'
import type { File } from '#src/modules/files/entities/file.entity.js'

interface FileStorageKeyOptions {
  fileUuid: FileUuid
  mimeType: MimeType
  isPublic?: boolean
  variantLabel?: string
}

@Injectable()
export class FileStorageKeyFactory {
  private env: string

  constructor (config: ConfigService) {
    this.env = config.getOrThrow<string>('NODE_ENV')
  }

  create (options: FileStorageKeyOptions): string {
    const pathParts = [this.env]

    if (options.isPublic === true) {
      pathParts.push('public')
    }

    const fileName = options.variantLabel !== undefined
      ? `${options.fileUuid}-${options.variantLabel}`
      : options.fileUuid

    const extension = MimeTypeSuffix[options.mimeType]

    return `${pathParts.join('/')}/${fileName}.${extension}`
  }

  createFromFile (file: File, variantLabel?: string): string {
    return this.create({
      fileUuid: file.uuid,
      mimeType: file.mimeType,
      isPublic: file.isPublic,
      variantLabel
    })
  }
}
