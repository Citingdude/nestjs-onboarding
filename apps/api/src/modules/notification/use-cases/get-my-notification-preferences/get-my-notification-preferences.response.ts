import { ApiProperty } from '@nestjs/swagger'
import { exhaustiveCheck } from '@wisemen/nestjs-common'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { NotificationType, NotificationTypeApiProperty } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationPreset, NotificationPresetApiProperty } from '#src/modules/notification/enums/notification-preset.enum.js'

export class PreferenceTypes {
  @NotificationTypeApiProperty({ isArray: true })
  email: NotificationType[]

  @NotificationTypeApiProperty({ isArray: true })
  sms: NotificationType[]

  @NotificationTypeApiProperty({ isArray: true })
  app: NotificationType[]

  @NotificationTypeApiProperty({ isArray: true })
  push: NotificationType[]

  constructor () {
    this.email = []
    this.sms = []
    this.app = []
    this.push = []
  }
}

export class GetMyNotificationPreferencesResponse {
  @NotificationPresetApiProperty()
  preset: NotificationPreset

  @ApiProperty({ type: Boolean })
  emailEnabled: boolean = false

  @ApiProperty({ type: Boolean })
  smsEnabled: boolean = false

  @ApiProperty({ type: Boolean })
  appEnabled: boolean = false

  @ApiProperty({ type: Boolean })
  pushEnabled: boolean = false

  @ApiProperty({ type: PreferenceTypes })
  preferences: PreferenceTypes = new PreferenceTypes()

  constructor (notificationPreferences: NotificationPreferences[], preset: NotificationPreset) {
    this.preset = preset
    for (const preference of notificationPreferences) {
      switch (preference.channel) {
        case NotificationChannel.EMAIL:
          this.emailEnabled = preference.isEnabled
          this.preferences.email = preference.types
          break
        case NotificationChannel.SMS:
          this.smsEnabled = preference.isEnabled
          this.preferences.sms = preference.types
          break
        case NotificationChannel.APP:
          this.appEnabled = preference.isEnabled
          this.preferences.app = preference.types
          break
        case NotificationChannel.PUSH:
          this.pushEnabled = preference.isEnabled
          this.preferences.push = preference.types
          break
        default:
          exhaustiveCheck(preference.channel)
      }
    }
  }
}
