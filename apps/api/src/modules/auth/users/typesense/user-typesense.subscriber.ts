import { Injectable } from '@nestjs/common'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { UserUpdatedEvent } from '#src/modules/auth/users/use-cases/sync-user-from-zitadel/user-updated.event.js'
import { UserCreatedEvent } from '#src/modules/auth/users/use-cases/get-or-create-user/user-created.event.js'
import { SyncTypesenseJob } from '#src/modules/typesense/use-cases/sync-collection/sync-typesense-collection.job.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

@Injectable()
export class UserTypesenseSubscriber {
  constructor (
    private readonly jobScheduler: PgBossScheduler
  ) {}

  @Subscribe(UserCreatedEvent)
  @Subscribe(UserUpdatedEvent)
  async handle (): Promise<void> {
    const job = new SyncTypesenseJob(TypesenseCollectionName.USER)

    await this.jobScheduler.scheduleJob(job)
  }
}
