import { Module } from '@nestjs/common'
import { MigrateCollectionsHandler } from './migrate-collections.handler.js'
import { MigrateCollectionsModule } from '#src/modules/typesense/use-cases/migrate-collections/migrate-collections.module.js'

@Module({
  imports: [MigrateCollectionsModule],
  providers: [MigrateCollectionsHandler]
})
export class MigrateCollectionsJobModule {}
