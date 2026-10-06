import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsUndefinable } from '@wisemen/validators'
import { UiTheme, UiThemeApiProperty } from '#src/app/user-preferences/enums/ui-theme.enum.js'
import { DisplayZoom, DisplayZoomApiProperty } from '#src/app/user-preferences/enums/display-zoom.enum.js'
import { Locale, LocaleApiProperty } from '#src/modules/localization/enums/locale.enum.js'
import { AutoCloseNotifications, AutoCloseNotificationsApiProperty } from '#src/app/user-preferences/enums/auto-close-notifications.enum.js'
import { NumberFormat, NumberFormatApiProperty } from '#src/app/user-preferences/enums/number-format.enum.js'
import { HourCycle, HourCycleApiProperty } from '#src/app/user-preferences/enums/hour-cycle.enum.js'

export class UpdateUserPreferencesCommand {
  @UiThemeApiProperty({ required: false })
  @IsUndefinable()
  @IsEnum(UiTheme)
  appearance?: UiTheme

  @LocaleApiProperty({ required: false })
  @IsUndefinable()
  @IsString()
  language?: Locale

  @DisplayZoomApiProperty({ required: false })
  @IsUndefinable()
  @IsString()
  displayZoom?: DisplayZoom

  @ApiPropertyOptional({ type: 'boolean', required: false })
  @IsUndefinable()
  @IsBoolean()
  showShortcuts?: boolean

  @ApiPropertyOptional({ type: 'boolean', required: false })
  @IsUndefinable()
  @IsBoolean()
  showNavigationArrows?: boolean

  @AutoCloseNotificationsApiProperty({ required: false })
  @IsUndefinable()
  @IsEnum(AutoCloseNotifications)
  autoCloseNotifications?: AutoCloseNotifications

  @ApiPropertyOptional({ type: 'boolean', required: false })
  @IsUndefinable()
  @IsBoolean()
  reducedMotion?: boolean

  @ApiPropertyOptional({ type: 'boolean', required: false })
  @IsUndefinable()
  @IsBoolean()
  highContrast?: boolean

  @NumberFormatApiProperty({ required: false })
  @IsUndefinable()
  @IsEnum(NumberFormat)
  numberFormat?: NumberFormat

  @HourCycleApiProperty({ required: false })
  @IsUndefinable()
  @IsEnum(HourCycle)
  hourCycle?: HourCycle

  @ApiPropertyOptional({ type: 'string', required: false, nullable: true })
  @IsOptional()
  @IsString()
  timeZone?: string | null
}
