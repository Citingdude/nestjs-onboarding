import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { ViewContactDetailResponse } from './view-contact-detail.response.js'
import { FilePresigner } from '#src/modules/files/modules/file-presigner/file-presigner.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

@Injectable()
export class ViewContactDetailUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(Contact)
    private readonly contactRepository: TypeOrmRepository<Contact>,
    private readonly filePresigner: FilePresigner
  ) {}

  public async execute (uuid: ContactUuid): Promise<ViewContactDetailResponse> {
    const contact = await readonly(this.dataSource, async () =>
      await this.contactRepository.findOneOrFail({
        where: { uuid },
        relations: {
          avatar: true,
          file: true
        }
      })
    )

    const presignedAvatar = contact.avatar
      ? await this.filePresigner.presign(contact.avatar)
      : null

    return new ViewContactDetailResponse(contact, presignedAvatar)
  }
}
