import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { MigrateCollectionsUseCase } from './migrate-collections.use-case.js'
import { MigrateCollectionsController } from './migrate-collections.controller.js'
import { MigrateCollectionsGroupCalculator } from './migrate-collections-group.calculator.js'
import { TypesenseSync } from '#src/modules/typesense/use-cases/sync-collection/typesense-sync.entity.js'
import { TypesenseClientModule } from '#src/modules/typesense/typesense.client.module.js'

@Module({
  imports: [
    TypesenseClientModule,
    TypeOrmModule.forFeature([TypesenseSync])
  ],
  controllers: [MigrateCollectionsController],
  providers: [
    MigrateCollectionsUseCase,
    MigrateCollectionsGroupCalculator
  ],
  exports: [MigrateCollectionsUseCase]
})
export class MigrateCollectionsModule {}
