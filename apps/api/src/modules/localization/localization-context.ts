import { Injectable } from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'
import { isEnum } from 'class-validator'
import { Locale } from './enums/locale.enum.js'
import { DEFAULT_LANGUAGE } from './constants/defaults.constant.js'

@Injectable()
export class LocalizationContext {
  /** Get the current **supported** language, uses fallback if none or not supported */
  get language (): string | undefined {
    return I18nContext.current()?.lang
  }

  /** Get the current **supported** locale, uses fallback if none or not supported */
  get locale (): Locale {
    return this.mapLocale(this.language)
  }

  private mapLocale (language: string | undefined | null): Locale {
    if (isEnum(language, Locale)) {
      return language as Locale
    } else {
      return DEFAULT_LANGUAGE
    }
  }
}
