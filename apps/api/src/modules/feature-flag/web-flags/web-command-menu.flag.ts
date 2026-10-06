import { createFlag } from '@wisemen/nestjs-feature-flags'

export const WebCommandMenuFlag = createFlag({
  type: 'boolean',
  name: 'web_command_menu',
  defaultValue: true
})
