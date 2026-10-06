import { Module } from '@nestjs/common'
import { SearchCollectionsController } from './search-collections.controller.js'
import { SearchCollectionsUseCase } from './search-collections.use-case.js'
import { PermissionHttpModule } from '#src/modules/auth/permission/permission.http.module.js'
import { TypesenseModule } from '#src/modules/typesense/typesense.module.js'
import { GlobalSearchCollectionsModule } from '#src/modules/global-search/collections/global-search-collections.module.js'

@Module({
  imports: [
    TypesenseModule,
    PermissionHttpModule,
    GlobalSearchCollectionsModule
  ],
  controllers: [SearchCollectionsController],
  providers: [SearchCollectionsUseCase]
})
export class SearchCollectionsModule {}
