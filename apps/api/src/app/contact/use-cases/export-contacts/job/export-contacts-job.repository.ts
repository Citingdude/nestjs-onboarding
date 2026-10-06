import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { ReadStream } from 'typeorm/platform/PlatformTools.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { ExportStatus } from '#src/app/export/entities/export-status.enum.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export type ExportContactRecord = Pick<Contact, 'uuid' | 'firstName' | 'lastName' | 'email' | 'phone'>

@Injectable()
export class ExportContactsJobRepository {
  constructor (
    @InjectRepository(UserPreferences) private userPrefRepo: TypeOrmRepository<UserPreferences>,
    @InjectRepository(Contact) private contactRepository: TypeOrmRepository<Contact>,
    @InjectRepository(Export) private exportRepository: TypeOrmRepository<Export>,
    @InjectRepository(File) private fileRepository: TypeOrmRepository<File>
  ) { }

  async findUserPreferences (userUuid: UserUuid): Promise<UserPreferences | null> {
    return this.userPrefRepo.findOneBy({ userUuid })
  }

  streamContacts (): Promise<ReadStream> {
    return this.contactRepository.createQueryBuilder('c')
      .select([
        'c.uuid AS uuid',
        'c.firstName AS "firstName"',
        'c.lastName AS "lastName"',
        'c.email AS email',
        'c.phone AS phone'
      ])
      .stream()
  }

  async failExport (uuid: ExportUuid, message: string): Promise<void> {
    await this.exportRepository.update(uuid, {
      status: ExportStatus.FAILED,
      errorMessage: message
    })
  }

  async completeExport (uuid: ExportUuid, fileUuid: FileUuid): Promise<void> {
    await this.exportRepository.update(uuid, {
      status: ExportStatus.SUCCEEDED,
      fileUuid
    })
  }

  async insertFile (file: File): Promise<void> {
    await this.fileRepository.insert(file)
  }
}
