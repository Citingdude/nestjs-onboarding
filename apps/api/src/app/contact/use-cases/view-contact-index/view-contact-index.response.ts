import { ApiProperty } from '@nestjs/swagger'
import { PaginatedOffsetResponse } from '@wisemen/pagination'
import type { ContactIndexResponseType } from '@repo/types'
import { AddressResponse, AddressBuilder } from '@wisemen/address'
import { Typesense } from '@wisemen/nestjs-typesense'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import type { TypesenseContact } from '#src/app/contact/typesense/contact.typesense-collection.js'

export class ContactResponse implements ContactIndexResponseType {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: ContactUuid

  @ApiProperty({ type: Boolean })
  isActive: boolean

  @ApiProperty({ type: String, example: 'John' })
  name: string

  @ApiProperty({ type: String, format: 'email', nullable: true })
  email: string | null

  @ApiProperty({ type: String, format: 'phone', nullable: true })
  phone: string | null

  @ApiProperty({ type: AddressResponse, nullable: true })
  address: AddressResponse | null

  constructor (contact: TypesenseContact) {
    this.uuid = contact.id
    this.isActive = contact.isActive ?? false
    this.name = contact.name
    this.email = contact.email ?? null
    this.phone = contact.phone ?? null
    this.address = new AddressResponse(new AddressBuilder()
      .withCity(contact.city)
      .withCountry(contact.country)
      .withPostalCode(contact.postalCode)
      .withStreetName(contact.streetName)
      .withStreetNumber(contact.streetNumber)
      .withUnit(contact.unit)
      .withCoordinates(Typesense.parseGeopoint(contact.coordinates))
      .build()
    )
  }
}

export class ViewContactIndexResponse extends PaginatedOffsetResponse<ContactResponse> {
  @ApiProperty({ type: ContactResponse, isArray: true })
  declare items: ContactResponse[]

  constructor (contacts: PaginatedOffsetResponse<TypesenseContact>) {
    const contactItems = contacts.items.map(contact => new ContactResponse(contact))

    super(contactItems, contacts.meta)
  }
}
