import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { FileUploadedEvent } from './file-uploaded.event.js'
import { ConfirmFileUploadCommand } from './confirm-file-upload.command.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'

@Injectable()
export class ConfirmFileUploadUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    @InjectRepository(File)
    private fileRepository: TypeOrmRepository<File>
  ) {}

  async execute (fileUuid: FileUuid, command: ConfirmFileUploadCommand): Promise<void> {
    const file = await this.fileRepository.findOneBy({ uuid: fileUuid })

    if (file === null) {
      throw new FileNotFoundError(fileUuid)
    }

    await transaction(this.dataSource, async () => {
      await this.fileRepository.update(
        { uuid: file.uuid },
        { isUploadConfirmed: true, blurHash: command.blurHash }
      )
      await this.eventEmitter.emitOne(new FileUploadedEvent(file))
    })
  }
}
