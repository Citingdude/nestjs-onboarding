import { Module } from '@nestjs/common'
import { ProviderExplorerModule } from '@wisemen/nestjs-provider-explorer'
import { GlobalSearchCollections } from './global-search-collections.js'

@Module({
  imports: [ProviderExplorerModule],
  providers: [GlobalSearchCollections],
  exports: [GlobalSearchCollections]
})
export class GlobalSearchCollectionsModule {}
