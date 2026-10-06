import { createFlag } from '@wisemen/nestjs-feature-flags'
import { MailProvider } from '@wisemen/nestjs-mail'

export const MailProviderFlag = createFlag({
  type: 'string',
  enum: MailProvider,
  defaultValue: MailProvider.SCALEWAY,
  name: 'mail_provider'
})
