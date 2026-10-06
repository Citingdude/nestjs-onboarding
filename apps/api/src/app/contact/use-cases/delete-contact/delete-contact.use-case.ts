import { Injectable } from '@nestjs/common'
import { InjectRepository, transaction, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { ContactDeletedEvent } from './contact-deleted.event.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { ContactNotFoundError } from '#src/app/contact/errors/contact.not-found.error.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

@Injectable()
export class DeleteContactUseCase {
  constructor (
    private readonly datasource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    @InjectRepository(Contact)
    private contactRepository: TypeOrmRepository<Contact>
  ) {}

  public async execute (uuid: ContactUuid): Promise<void> {
    const exists = await this.contactRepository.existsBy({ uuid })

    if (!exists) {
      throw new ContactNotFoundError(uuid)
    }

    const event = new ContactDeletedEvent(uuid)
    await transaction(this.datasource, async () => {
      await this.contactRepository.softDelete({ uuid })
      await this.eventEmitter.emit([event])
    })
  }
}
