import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

export class UpdateContactRepository {
  constructor (
    @InjectRepository(Contact) private readonly contactRepo: TypeOrmRepository<Contact>,
    @InjectRepository(File) private readonly fileRepo: TypeOrmRepository<File>
  ) {}

  async findContact (contactUuid: ContactUuid): Promise<Contact | null> {
    return await this.contactRepo.findOneBy({ uuid: contactUuid })
  }

  async fileExists (fileUuid: FileUuid): Promise<boolean> {
    return await this.fileRepo.existsBy({
      uuid: fileUuid,
      isUploadConfirmed: true
    })
  }

  async updateContact (contact: Contact): Promise<void> {
    await this.contactRepo.save(contact)
  }
}
