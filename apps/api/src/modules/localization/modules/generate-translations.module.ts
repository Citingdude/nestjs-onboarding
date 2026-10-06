import { join } from 'path'
import { Global, Module, type OnModuleInit } from '@nestjs/common'
import { AcceptLanguageResolver, I18nModule, I18nService } from 'nestjs-i18n'
import { ModuleRef } from '@nestjs/core'
import { LocalizationContext } from '#src/modules/localization/localization-context.js'
import { DEFAULT_LANGUAGE } from '#src/modules/localization/constants/defaults.constant.js'

@Global()
@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: DEFAULT_LANGUAGE,
        loaderOptions: {
          path: join(process.cwd(), '/src/modules/localization/resources/')
        },
        typesOutputPath: join(process.cwd(), '/src/modules/localization/generated/i18n.generated.ts')
      }),
      resolvers: [
        AcceptLanguageResolver
      ]
    })
  ],
  providers: [LocalizationContext],
  exports: [LocalizationContext]
})
export class GenerateTranslationsModule implements OnModuleInit {
  private static i18nService: I18nService | undefined

  static default (): I18nService | undefined {
    return GenerateTranslationsModule.i18nService
  }

  constructor (
    private readonly moduleRef: ModuleRef
  ) { }

  onModuleInit (): void {
    GenerateTranslationsModule.i18nService = this.moduleRef.get(I18nService, { strict: false })
  }
}
