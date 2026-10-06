import { ApiProperty } from '@nestjs/swagger'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import { UiTheme, UiThemeApiProperty } from '#src/app/user-preferences/enums/ui-theme.enum.js'
import { DisplayZoom, DisplayZoomApiProperty } from '#src/app/user-preferences/enums/display-zoom.enum.js'
import { Locale, LocaleApiProperty } from '#src/modules/localization/enums/locale.enum.js'
import { AutoCloseNotifications, AutoCloseNotificationsApiProperty } from '#src/app/user-preferences/enums/auto-close-notifications.enum.js'
import { NumberFormat, NumberFormatApiProperty } from '#src/app/user-preferences/enums/number-format.enum.js'
import { HourCycle, HourCycleApiProperty } from '#src/app/user-preferences/enums/hour-cycle.enum.js'

export class ViewUserPreferencesResponse {
  @UiThemeApiProperty()
  appearance: UiTheme

  @LocaleApiProperty()
  language: Locale

  @DisplayZoomApiProperty()
  displayZoom: DisplayZoom

  @ApiProperty({ type: 'boolean' })
  showShortcuts: boolean

  @ApiProperty({ type: 'boolean' })
  showNavigationArrows: boolean

  @AutoCloseNotificationsApiProperty()
  autoCloseNotifications: AutoCloseNotifications

  @ApiProperty({ type: 'boolean' })
  reducedMotion: boolean

  @ApiProperty({ type: 'boolean' })
  highContrast: boolean

  @NumberFormatApiProperty()
  numberFormat: NumberFormat

  @HourCycleApiProperty()
  hourCycle: HourCycle

  @ApiProperty({ type: 'string', nullable: true })
  timeZone: string | null

  constructor (preferences: UserPreferences) {
    this.appearance = preferences.appearance
    this.language = preferences.language
    this.displayZoom = preferences.displayZoom
    this.showShortcuts = preferences.showShortcuts
    this.showNavigationArrows = preferences.showNavigationArrows
    this.autoCloseNotifications = preferences.autoCloseNotifications
    this.reducedMotion = preferences.reducedMotion
    this.highContrast = preferences.highContrast
    this.numberFormat = preferences.numberFormat
    this.hourCycle = preferences.hourCycle
    this.timeZone = preferences.timeZone
  }
}
