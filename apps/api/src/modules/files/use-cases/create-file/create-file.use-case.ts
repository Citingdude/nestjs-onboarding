import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { SECONDS_PER_MINUTE } from '@wisemen/datewise'
import { FileStorage } from '@wisemen/nestjs-file-storage'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { CreateFileCommand } from './create-file.command.js'
import { CreateFileResponse } from './create-file.response.js'
import { FileCreatedEvent } from './file-created.event.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Injectable()
export class CreateFileUseCase {
  private static readonly EXPIRES_IN_MINUTES = 10

  constructor (
    private dataSource: DataSource,
    private eventEmitter: DomainEventEmitter,
    @InjectRepository(File)
    private fileRepository: TypeOrmRepository<File>,
    private fileStorage: FileStorage,
    private keyFactory: FileStorageKeyFactory
  ) {}

  async execute (
    command: CreateFileCommand,
    userUuid: UserUuid | null
  ): Promise<CreateFileResponse> {
    const file = new FileBuilder()
      .withName(command.name)
      .withMimeType(command.mimeType)
      .withIsPublic(command.isPublic === 'true')
      .withUploaderUuid(userUuid)
      .build()

    const key = this.keyFactory.createFromFile(file)
    file.key = key

    const expiresInTenMinutes = CreateFileUseCase.EXPIRES_IN_MINUTES * SECONDS_PER_MINUTE
    const uploadUrl = await this.fileStorage.createTemporaryUploadUrl(
      key,
      file.mimeType,
      expiresInTenMinutes,
      file.isPublic
    )

    await transaction(this.dataSource, async () => {
      await this.fileRepository.insert(file)
      await this.eventEmitter.emitOne(new FileCreatedEvent(file))
    })

    return new CreateFileResponse(file, uploadUrl)
  }
}
