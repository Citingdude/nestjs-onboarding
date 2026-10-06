import { ApiProperty } from '@nestjs/swagger'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

export class CreateContactResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: ContactUuid

  constructor (contact: Contact) {
    this.uuid = contact.uuid
  }
}
