import { Module } from '@nestjs/common'
import { ImportCollectionsUseCase } from './import-collections.use-case.js'
import { ImportCollectionsController } from './import-collections.controller.js'
import { TypesenseClientModule } from '#src/modules/typesense/typesense.client.module.js'

@Module({
  imports: [TypesenseClientModule],
  controllers: [ImportCollectionsController],
  providers: [ImportCollectionsUseCase]
})
export class ImportCollectionsModule {}
