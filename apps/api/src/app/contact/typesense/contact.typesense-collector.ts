import { MoreThanOrEqual } from 'typeorm'
import { AnyOrIgnore, InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { RegisterTypesenseCollector, Typesense, type TypesenseCollector } from '@wisemen/nestjs-typesense'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import type { ContactCollection, TypesenseContact } from '#src/app/contact/typesense/contact.typesense-collection.js'

@RegisterTypesenseCollector(TypesenseCollectionName.CONTACT)
export class ContactTypesenseCollector implements TypesenseCollector<ContactCollection> {
  static readonly BATCH_SIZE = 10_000

  constructor (
    @InjectRepository(Contact) private contactRepository: TypeOrmRepository<Contact>
  ) {}

  transform (contacts: Contact[]): TypesenseContact[] {
    return contacts.map(contact => this.transformContact(contact))
  }

  fetch (uuids?: ContactUuid[]): AsyncGenerator<Contact[], void, void> {
    return this.contactRepository.findByInBatches({
      uuid: AnyOrIgnore(uuids)
    }, ContactTypesenseCollector.BATCH_SIZE)
  }

  fetchChanged (since: Date): AsyncGenerator<Contact[], void, void> {
    return this.contactRepository.findByInBatches({
      updatedAt: MoreThanOrEqual(since)
    }, ContactTypesenseCollector.BATCH_SIZE)
  }

  async* fetchRemoved (since: Date): AsyncGenerator<ContactUuid[], void, void> {
    const contractGen = this.contactRepository.findInBatches({
      select: { uuid: true },
      where: { deletedAt: MoreThanOrEqual(since) },
      withDeleted: true
    }, ContactTypesenseCollector.BATCH_SIZE)

    for await (const contacts of contractGen) {
      yield contacts.map(c => c.uuid)
    }
  }

  private transformContact (contact: Contact): TypesenseContact {
    return {
      id: contact.uuid,
      name: (contact.firstName ?? '') + ' ' + (contact.lastName ?? ''),
      email: contact.email ?? undefined,
      phone: contact.phone ?? undefined,
      country: contact.address?.country ?? undefined,
      city: contact.address?.city ?? undefined,
      postalCode: contact.address?.postalCode ?? undefined,
      streetName: contact.address?.streetName ?? undefined,
      streetNumber: contact.address?.streetNumber ?? undefined,
      unit: contact.address?.unit ?? undefined,
      coordinates: Typesense.createGeopoint(contact.address?.coordinates),
      isActive: contact.isActive ?? undefined
    }
  }
}
