import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { PresignedFileResponse } from '#src/modules/files/responses/presigned-file.response.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import { InvalidPublicFileTokenError } from '#src/modules/files/errors/invalid-public-file-token.error.js'
import { FilePresigner } from '#src/modules/files/modules/file-presigner/file-presigner.js'

@Injectable()
export class DownloadPublicFileUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(File)
    private readonly fileRepository: TypeOrmRepository<File>,
    private readonly filePresigner: FilePresigner,
    private readonly jwtService: JwtService
  ) {}

  async execute (fileUuid: FileUuid, token: string): Promise<PresignedFileResponse> {
    await this.verifyToken(fileUuid, token)

    const file = await readonly(this.dataSource, async () =>
      await this.fileRepository.findOneBy({
        uuid: fileUuid,
        isPublic: true
      })
    )

    if (file === null) {
      throw new FileNotFoundError(fileUuid)
    }

    const presigned = await this.filePresigner.presign(file)
    return new PresignedFileResponse(presigned)
  }

  private async verifyToken (fileUuid: FileUuid, token: string): Promise<void> {
    const payload = await this.jwtService.verifyAsync<{ service: string, fileUuid: FileUuid }>(
      token)

    if (payload.service !== 'public-file-download') {
      throw new InvalidPublicFileTokenError('Token is not valid for public file downloads')
    }

    const tokenFileUuid = payload.fileUuid

    if (typeof tokenFileUuid !== 'string') {
      throw new InvalidPublicFileTokenError('Token does not include a file reference')
    }

    if (tokenFileUuid !== fileUuid) {
      throw new InvalidPublicFileTokenError('Token is not valid for the requested file')
    }
  }
}
