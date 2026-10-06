import { Module } from '@nestjs/common'
import { ViewCollectionsController } from './view-collections.controller.js'
import { ViewCollectionsUseCase } from './view-collections.use-case.js'
import { TypesenseClientModule } from '#src/modules/typesense/typesense.client.module.js'

@Module({
  imports: [TypesenseClientModule],
  controllers: [ViewCollectionsController],
  providers: [ViewCollectionsUseCase]
})
export class ViewCollectionsModule {}
