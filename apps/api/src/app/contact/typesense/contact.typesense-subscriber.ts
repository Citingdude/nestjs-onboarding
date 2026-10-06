import { Injectable } from '@nestjs/common'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { SyncTypesenseJob } from '#src/modules/typesense/use-cases/sync-collection/sync-typesense-collection.job.js'
import { ContactCreatedEvent } from '#src/app/contact/use-cases/create-contact/contact-created.event.js'
import { ContactUpdatedEvent } from '#src/app/contact/use-cases/update-contact/contact-updated.event.js'
import { ContactDeletedEvent } from '#src/app/contact/use-cases/delete-contact/contact-deleted.event.js'

@Injectable()
export class ContactTypesenseSubscriber {
  constructor (
    private readonly jobScheduler: PgBossScheduler
  ) {}

  @Subscribe(ContactCreatedEvent)
  @Subscribe(ContactUpdatedEvent)
  @Subscribe(ContactDeletedEvent)
  async handle (): Promise<void> {
    const job = new SyncTypesenseJob(TypesenseCollectionName.CONTACT)
    await this.jobScheduler.scheduleJob(job)
  }
}
