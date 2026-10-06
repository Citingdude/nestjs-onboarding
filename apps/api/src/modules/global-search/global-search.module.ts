import { Module } from '@nestjs/common'
import { SearchCollectionsModule } from './search-collections/search-collections.module.js'

@Module({
  imports: [SearchCollectionsModule]
})
export class GlobalSearchModule {}
