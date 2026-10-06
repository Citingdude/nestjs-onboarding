import { ApiProperty } from '@nestjs/swagger'
import { AddressResponse, AddressBuilder } from '@wisemen/address'
import { Typesense } from '@wisemen/nestjs-typesense'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import type { TypesenseContact } from '#src/app/contact/typesense/contact.typesense-collection.js'

export class ContactGlobalSearchResponse {
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
