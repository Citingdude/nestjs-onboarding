import assert from 'assert'
import { ApiProperty } from '@nestjs/swagger'
import { MonetaryDto } from '@wisemen/monetary'
import { AddressResponse } from '@wisemen/address'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { FileResponse } from '#src/modules/files/responses/file.response.js'
import { PresignedFileResponse } from '#src/modules/files/responses/presigned-file.response.js'
import { PresignedFile } from '#src/modules/files/entities/presigned-file.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

export class ViewContactDetailResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: ContactUuid

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: string

  @ApiProperty({ type: Boolean })
  isActive: boolean

  @ApiProperty({ type: String, nullable: true, example: 'John' })
  firstName: string | null

  @ApiProperty({ type: String, nullable: true, example: 'Doe' })
  lastName: string | null

  @ApiProperty({ type: String, format: 'email', nullable: true })
  email: string | null

  @ApiProperty({ type: String, format: 'phone', nullable: true })
  phone: string | null

  @ApiProperty({ type: AddressResponse, nullable: true })
  address: AddressResponse | null

  @ApiProperty({ type: FileResponse, nullable: true })
  file: FileResponse | null

  @ApiProperty({ type: PresignedFileResponse, nullable: true })
  avatar: PresignedFileResponse | null

  @ApiProperty({ type: MonetaryDto, nullable: true })
  discount: MonetaryDto | null

  @ApiProperty({ type: MonetaryDto, nullable: true })
  balance: MonetaryDto | null

  @ApiProperty({ type: 'string', nullable: true, format: 'date' })
  birthDate: string | null

  constructor (contact: Contact, avatar: PresignedFile | null) {
    assert(contact.file !== undefined)

    this.uuid = contact.uuid
    this.createdAt = contact.createdAt.toISOString()
    this.updatedAt = contact.updatedAt.toISOString()
    this.isActive = contact.isActive
    this.firstName = contact.firstName
    this.lastName = contact.lastName
    this.email = contact.email
    this.phone = contact.phone
    this.address = contact.address ? new AddressResponse(contact.address) : null
    this.file = (contact.file !== null) ? new FileResponse(contact.file) : null
    this.discount = MonetaryDto.from(contact.discount)
    this.balance = MonetaryDto.from(contact.balance)
    this.avatar = avatar ? new PresignedFileResponse(avatar) : null
    this.birthDate = contact.birthDate?.toString() ?? null
  }
}
