import type { MonetaryDto } from '@wisemen/monetary'
import type { AddressCommand } from '@wisemen/address'
import { CreateContactCommand } from './create-contact.command.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class CreateContactCommandBuilder {
  private command: CreateContactCommand

  constructor () {
    this.command = new CreateContactCommand()
    this.command.firstName = 'John'
    this.command.lastName = 'Doe'
    this.command.email = null
    this.command.phone = null
    this.command.address = null
    this.command.fileUuid = null
    this.command.discount = null
    this.command.balance = null
    this.command.avatarUuid = null
    this.command.birthDate = null
  }

  withFirstName (firstName: string): this {
    this.command.firstName = firstName
    return this
  }

  withLastName (lastName: string): this {
    this.command.lastName = lastName
    return this
  }

  withEmail (email: string): this {
    this.command.email = email
    return this
  }

  withPhone (phone: string): this {
    this.command.phone = phone
    return this
  }

  withAddress (address: AddressCommand | null): this {
    this.command.address = address
    return this
  }

  withFileUuid (fileUuid: FileUuid | null): this {
    this.command.fileUuid = fileUuid
    return this
  }

  withAvatarUuid (avatarUuid: FileUuid | null): this {
    this.command.avatarUuid = avatarUuid
    return this
  }

  withDiscount (amount: MonetaryDto | null): this {
    this.command.discount = amount
    return this
  }

  withBalance (amount: MonetaryDto | null): this {
    this.command.balance = amount
    return this
  }

  withBirthDate (date: string | null): this {
    this.command.birthDate = date
    return this
  }

  build (): CreateContactCommand {
    return this.command
  }
}
