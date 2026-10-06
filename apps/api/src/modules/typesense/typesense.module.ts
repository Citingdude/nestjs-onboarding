import { Module, type OnApplicationBootstrap } from '@nestjs/common'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { MigrateCollectionsModule } from './use-cases/migrate-collections/migrate-collections.module.js'
import { ImportCollectionsModule } from './use-cases/import-collections/import-collections.module.js'
import { ViewCollectionsModule } from './use-cases/view-collections/view-collections.module.js'
import { ViewCollectionIndexModule } from './use-cases/view-collections-index/view-collection-index.module.js'
import { MigrateCollectionsJob } from './use-cases/migrate-collections/job/migrate-collections.job.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'
import { TypesenseContactModule } from '#src/app/contact/typesense/contact.typesense.module.js'
import { TypesenseUserModule } from '#src/modules/auth/users/typesense/user-typesense.module.js'
import { TypesenseClientModule } from '#src/modules/typesense/typesense.client.module.js'

@Module({
  imports: [
    TypesenseClientModule,
    TypesenseUserModule,
    TypesenseContactModule,

    MigrateCollectionsModule,
    ImportCollectionsModule,
    ViewCollectionsModule,
    ViewCollectionIndexModule,

    DefaultPgBossSchedulerModule
  ],
  exports: [TypesenseClientModule]
})
export class TypesenseModule implements OnApplicationBootstrap {
  constructor (
    private readonly scheduler: PgBossScheduler
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    await this.scheduler.scheduleJob(new MigrateCollectionsJob())
  }
}
