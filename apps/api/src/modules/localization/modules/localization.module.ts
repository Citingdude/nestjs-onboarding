import { join } from 'path'
import { Global, Module, type OnModuleInit } from '@nestjs/common'
import { AcceptLanguageResolver, I18nModule, I18nService } from 'nestjs-i18n'
import { ModuleRef } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { DEFAULT_LANGUAGE } from '#src/modules/localization/constants/defaults.constant.js'
import { EnvType } from '#src/modules/config/env.enum.js'
import { LocalizationContext } from '#src/modules/localization/localization-context.js'

@Global()
@Module({
  imports: [
    I18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: DEFAULT_LANGUAGE,
        loaderOptions: {
          path: join(process.cwd(), '/dist/src/modules/localization/resources/'),
          watch: configService.get('NODE_ENV', 'local') === EnvType.LOCAL
        }
      }),
      resolvers: [
        AcceptLanguageResolver
      ]
    })
  ],
  providers: [LocalizationContext],
  exports: [LocalizationContext]
})
export class LocalizationModule implements OnModuleInit {
  private static i18nService: I18nService | undefined

  static default (): I18nService | undefined {
    return LocalizationModule.i18nService
  }

  constructor (
    private readonly moduleRef: ModuleRef
  ) { }

  onModuleInit (): void {
    LocalizationModule.i18nService = this.moduleRef.get(I18nService, { strict: false })
  }
}
