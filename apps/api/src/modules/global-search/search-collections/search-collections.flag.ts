import { createFlag } from '@wisemen/nestjs-feature-flags'

export const SearchCollectionsFlag = createFlag({
  type: 'boolean',
  defaultValue: true,
  name: 'search_collections_enabled'
})
