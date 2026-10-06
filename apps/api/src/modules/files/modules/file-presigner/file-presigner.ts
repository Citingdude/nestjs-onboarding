import { Injectable } from '@nestjs/common'
import { FileStorage } from '@wisemen/nestjs-file-storage'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PRESIGN_FILE_EXPIRES_IN_SECONDS } from './file-presigner.constant.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { PresignedFile } from '#src/modules/files/entities/presigned-file.js'
import { PresignedFileBuilder } from '#src/modules/files/entities/presigned-file.builder.js'

@Injectable()
export class FilePresigner {
  constructor (
    private fileStorage: FileStorage,
    private jwtService: JwtService,
    private configService: ConfigService,
    private keyFactory: FileStorageKeyFactory
  ) {}

  async presign (file: File): Promise<PresignedFile> {
    const builder = new PresignedFileBuilder()
      .withFile(file)
      .withUrl(await this.createDownloadUrl(file))

    await Promise.all(file.variants.map(async variant =>
      builder.addVariant({
        label: variant.label,
        url: await this.createDownloadUrl(file, variant.label)
      })
    ))

    return builder.build()
  }

  private async createDownloadUrl (file: File, variantLabel?: string): Promise<string> {
    const key = this.keyFactory.createFromFile(file, variantLabel)

    if (file.isPublic) {
      return this.fileStorage.getPublicUrl(key)
    } else {
      return await this.fileStorage.createTemporaryDownloadUrl(
        key,
        file.name,
        file.mimeType,
        PRESIGN_FILE_EXPIRES_IN_SECONDS
      )
    }
  }

  async createPublicDownloadUrl (file: File): Promise<string> {
    const token = await this.jwtService.signAsync({
      service: 'public-file-download',
      fileUuid: file.uuid
    })

    const backendUrl = this.configService.getOrThrow<string>('BACKEND_URL')

    return new URL(`api/v1/public/files/${file.uuid}/download?token=${token}`, backendUrl).toString()
  }
}
