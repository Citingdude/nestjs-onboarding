import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { PresignedFileResponse } from '#src/modules/files/responses/presigned-file.response.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import { FilePresigner } from '#src/modules/files/modules/file-presigner/file-presigner.js'

@Injectable()
export class DownloadFileUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(File)
    private fileRepository: TypeOrmRepository<File>,
    private readonly filePresigner: FilePresigner
  ) {}

  async execute (fileUuid: FileUuid): Promise<PresignedFileResponse> {
    const file = await readonly(this.dataSource, async () =>
      await this.fileRepository.findOneBy({ uuid: fileUuid })
    )

    if (file === null) {
      throw new FileNotFoundError(fileUuid)
    }

    const presignedFile = await this.filePresigner.presign(file)
    return new PresignedFileResponse(presignedFile)
  }
}
