import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class CreateContactRepository {
  constructor (
    @InjectRepository(Contact) private readonly contactRepo: TypeOrmRepository<Contact>,
    @InjectRepository(File) private readonly fileRepo: TypeOrmRepository<File>
  ) {}

  async fileExists (fileUuid: FileUuid): Promise<boolean> {
    return await this.fileRepo.existsBy({
      uuid: fileUuid,
      isUploadConfirmed: true
    })
  }

  async insert (contact: Contact): Promise<void> {
    await this.contactRepo.insert(contact)
  }
}
