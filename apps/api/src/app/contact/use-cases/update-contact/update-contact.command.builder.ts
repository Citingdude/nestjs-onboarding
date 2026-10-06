import type { MonetaryDto } from '@wisemen/monetary'
import type { AddressCommand } from '@wisemen/address'
import { UpdateContactCommand } from './update-contact.command.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class UpdateContactCommandBuilder {
  private command: UpdateContactCommand

  constructor () {
    this.command = new UpdateContactCommand()
    this.command.firstName = null
    this.command.lastName = null
    this.command.email = null
    this.command.phone = null
    this.command.isActive = true
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

  withIsActive (isActive: boolean): this {
    this.command.isActive = isActive
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

  build (): UpdateContactCommand {
    return this.command
  }
}
