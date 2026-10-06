import { createFlag } from '@wisemen/nestjs-feature-flags'

export const WebChangeAppearanceFlag = createFlag({
  type: 'boolean',
  name: 'web_change_appearance',
  defaultValue: true
})
