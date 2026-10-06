import { DataSource } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import { Injectable } from '@nestjs/common'
import { plainDate } from '@wisemen/datewise'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { CreateContactCommand } from './create-contact.command.js'
import { CreateContactResponse } from './create-contact.response.js'
import { ContactCreatedEvent } from './contact-created.event.js'
import { CreateContactRepository } from './create-contact.repository.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'

@Injectable()
export class CreateContactUseCase {
  constructor (
    private readonly datasource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private repository: CreateContactRepository
  ) {}

  public async execute (
    command: CreateContactCommand
  ): Promise<CreateContactResponse> {
    if (command.fileUuid != null && !await this.repository.fileExists(command.fileUuid)) {
      throw new FileNotFoundError(command.fileUuid)
    }

    if (command.avatarUuid != null && !await this.repository.fileExists(command.avatarUuid)) {
      throw new FileNotFoundError(command.avatarUuid)
    }

    const contact = new ContactBuilder()
      .withFirstName(command.firstName)
      .withLastName(command.lastName)
      .withEmail(command.email?.toLocaleLowerCase() ?? null)
      .withPhone(command.phone)
      .withAddress(command.address?.parse() ?? null)
      .withFileUuid(command.fileUuid)
      .withBalance(command.balance?.parse() ?? null)
      .withDiscount(command.discount?.parse() ?? null)
      .withAvatarUuid(command.avatarUuid)
      .withBirthDate(plainDate(command.birthDate))
      .build()

    const event = new ContactCreatedEvent(contact)

    await transaction(this.datasource, async () => {
      await this.repository.insert(contact)
      await this.eventEmitter.emit([event])
    })

    return new CreateContactResponse(contact)
  }
}
