import { Typesense, type InferDocumentType } from '@wisemen/nestjs-typesense'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

export const ContactCollection = Typesense.collection(TypesenseCollectionName.CONTACT, {
  id: Typesense.string().brand<ContactUuid>(),
  isActive: Typesense.bool().optional(),
  name: Typesense.string().sort().infix(),
  email: Typesense.string().sort().optional(),
  phone: Typesense.string().sort().optional(),
  country: Typesense.string().optional(),
  city: Typesense.string().optional(),
  postalCode: Typesense.string().optional(),
  streetName: Typesense.string().optional(),
  streetNumber: Typesense.string().optional(),
  unit: Typesense.string().optional(),
  coordinates: Typesense.geopoint().optional()
})

export type ContactCollection = typeof ContactCollection
export type ContactTypesenseCollection = ContactCollection
export type TypesenseContact = InferDocumentType<typeof ContactCollection>
