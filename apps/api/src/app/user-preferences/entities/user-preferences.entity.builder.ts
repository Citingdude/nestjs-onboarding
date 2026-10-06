import { generateUuid } from '@wisemen/nestjs-common'
import { UserPreferences } from './user-preferences.entity.js'
import { UiTheme } from '#src/app/user-preferences/enums/ui-theme.enum.js'
import { DisplayZoom } from '#src/app/user-preferences/enums/display-zoom.enum.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { AutoCloseNotifications } from '#src/app/user-preferences/enums/auto-close-notifications.enum.js'
import { NumberFormat } from '#src/app/user-preferences/enums/number-format.enum.js'
import { HourCycle } from '#src/app/user-preferences/enums/hour-cycle.enum.js'

export class UserPreferencesBuilder {
  private preference: UserPreferences

  constructor () {
    this.preference = new UserPreferences()

    this.preference.userUuid = generateUuid()
    this.preference.createdAt = new Date()
    this.preference.updatedAt = new Date()
    this.preference.displayZoom = DisplayZoom.DEFAULT
    this.preference.language = Locale.EN_US
    this.preference.highContrast = false
    this.preference.reducedMotion = false
    this.preference.showShortcuts = false
    this.preference.showNavigationArrows = false
    this.preference.appearance = UiTheme.SYSTEM
    this.preference.autoCloseNotifications = AutoCloseNotifications.ALL_EXCEPT_ERRORS
    this.preference.numberFormat = NumberFormat.SYSTEM
    this.preference.hourCycle = HourCycle.DEVICE_DEFAULT
    this.preference.timeZone = null

    return this
  }

  withUserUuid (userUuid: UserUuid): this {
    this.preference.userUuid = userUuid
    return this
  }

  withCreatedAt (createdAt: Date): this {
    this.preference.createdAt = createdAt
    return this
  }

  withUpdatedAt (updatedAt: Date): this {
    this.preference.updatedAt = updatedAt
    return this
  }

  withFontSize (fontSize: DisplayZoom): this {
    this.preference.displayZoom = fontSize
    return this
  }

  withDisplayZoom (displayZoom: DisplayZoom): this {
    this.preference.displayZoom = displayZoom
    return this
  }

  withLanguage (language: Locale): this {
    this.preference.language = language
    return this
  }

  withHighContrast (highContrast: boolean): this {
    this.preference.highContrast = highContrast
    return this
  }

  withReduceMotion (reduceMotion: boolean): this {
    this.preference.reducedMotion = reduceMotion
    return this
  }

  withReducedMotion (reducedMotion: boolean): this {
    this.preference.reducedMotion = reducedMotion
    return this
  }

  withShowShortcuts (showShortcuts: boolean): this {
    this.preference.showShortcuts = showShortcuts
    return this
  }

  withTheme (theme: UiTheme): this {
    this.preference.appearance = theme
    return this
  }

  withAppearance (appearance: UiTheme): this {
    this.preference.appearance = appearance
    return this
  }

  withShowNavigationArrows (showNavigationArrows: boolean): this {
    this.preference.showNavigationArrows = showNavigationArrows
    return this
  }

  withAutoCloseNotifications (autoCloseNotifications: AutoCloseNotifications): this {
    this.preference.autoCloseNotifications = autoCloseNotifications
    return this
  }

  withNumberFormat (numberFormat: NumberFormat): this {
    this.preference.numberFormat = numberFormat
    return this
  }

  withHourCycle (hourCycle: HourCycle): this {
    this.preference.hourCycle = hourCycle
    return this
  }

  withTimeZone (timeZone: string | null): this {
    this.preference.timeZone = timeZone
    return this
  }

  build (): UserPreferences {
    return this.preference
  }
}
