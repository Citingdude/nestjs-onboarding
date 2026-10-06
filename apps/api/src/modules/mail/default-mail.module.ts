import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FeatureFlags } from '@wisemen/nestjs-feature-flags'
import { MailModule, MailProvider, type MailModuleOptions, type MailPitMailClientOptions } from '@wisemen/nestjs-mail'
import { MailProviderFlag } from '#src/modules/mail/mail-provider.flag.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

@Module({
  imports: [
    MailModule.forRootAsync({
      inject: [ConfigService, FeatureFlags],
      useFactory: async (
        config: ConfigService,
        flags: FeatureFlags
      ): Promise<MailModuleOptions> => {
        const templateRootPath = process.cwd() + '/dist/src/modules'
        const env = config.get<string>('NODE_ENV', 'local')

        if (env === 'local' || env === 'test') {
          const username = config.get<string>('MAILPIT_USERNAME')?.trim()
          const password = config.get<string>('MAILPIT_PASSWORD')?.trim()
          let defaultFrom = config.get<string>('MAIL_FROM_NAME')?.trim()

          if (defaultFrom === undefined || defaultFrom === '') {
            defaultFrom = 'test@wisemen.digital'
          }

          let auth: MailPitMailClientOptions['auth']
          if (username === undefined || username === '' || password === undefined || password === '') {
            auth = undefined
          } else {
            auth = { username, password }
          }

          return {
            templateRootPath,
            queueName: QueueName.SYSTEM,
            client: {
              auth,
              defaultFrom,
              type: 'mailpit',
              url: config.get<string>('MAILPIT_URL') ?? config.getOrThrow<string>('MAIL_PIT_URL'),
              tag: (username !== undefined && username !== '') ? username : undefined
            }
          }
        }

        const provider = await flags.get(MailProviderFlag)

        switch (provider) {
          case MailProvider.SCALEWAY:
            return {
              templateRootPath,
              queueName: QueueName.SYSTEM,
              client: {
                type: MailProvider.SCALEWAY,
                region: config.get<string>('SCW_MAIL_REGION', 'fr-par'),
                projectId: config.getOrThrow<string>('SCW_MAIL_PROJECT_ID'),
                from: `${config.getOrThrow<string>('SCW_MAIL_FROM')}@${config.getOrThrow<string>('SCW_MAIL_DOMAIN')}`,
                apiKey: config.getOrThrow<string>('SCW_MAIL_API_KEY')
              }
            }
          case MailProvider.SEND_GRID:
            return {
              templateRootPath,
              queueName: QueueName.SYSTEM,
              client: {
                type: MailProvider.SEND_GRID,
                defaultFrom: config.getOrThrow<string>('MAIL_FROM_NAME'),
                apiToken: config.getOrThrow<string>('SENDGRID_API_TOKEN')
              }
            }
        }
      }
    })
  ],
  exports: [MailModule]
})
export class DefaultMailModule {}
