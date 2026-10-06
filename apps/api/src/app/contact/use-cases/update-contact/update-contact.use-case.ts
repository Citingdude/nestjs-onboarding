import { Injectable, Logger } from '@nestjs/common'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { plainDate } from '@wisemen/datewise'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { UpdateContactCommand } from './update-contact.command.js'
import { ContactUpdatedEvent } from './contact-updated.event.js'
import { UpdateContactRepository } from './update-contact.repository.js'
import { ContactNotFoundError } from '#src/app/contact/errors/contact.not-found.error.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'

@Injectable()
export class UpdateContactUseCase {
  constructor (
    private dataSource: DataSource,
    private eventEmitter: DomainEventEmitter,
    private repository: UpdateContactRepository
  ) {}

  public async execute (
    uuid: ContactUuid,
    command: UpdateContactCommand
  ): Promise<void> {
    const contact = await this.repository.findContact(uuid)
    if (contact === null) {
      throw new ContactNotFoundError(uuid)
    }

    if (command.fileUuid != null && !await this.repository.fileExists(command.fileUuid)) {
      throw new FileNotFoundError(command.fileUuid)
    }

    if (command.avatarUuid != null && !await this.repository.fileExists(command.avatarUuid)) {
      throw new FileNotFoundError(command.avatarUuid)
    }

    this.updateContact(contact, command)
    const event = new ContactUpdatedEvent(uuid)

    try {
      await transaction(this.dataSource, async () => {
        await this.repository.updateContact(contact)
        await this.eventEmitter.emit([event])
      })
    } catch (error) {
      Logger.log(error)
    }
  }

  private updateContact (contact: Contact, command: UpdateContactCommand): void {
    contact.address = command.address?.parse() ?? null
    contact.balance = command.balance?.parse() ?? null
    contact.discount = command.balance?.parse() ?? null
    contact.firstName = command.firstName
    contact.lastName = command.lastName
    contact.email = command.email?.toLocaleLowerCase() ?? null
    contact.phone = command.phone
    contact.isActive = command.isActive
    contact.fileUuid = command.fileUuid
    contact.avatarUuid = command.avatarUuid
    contact.birthDate = plainDate(command.birthDate)
  }
}
