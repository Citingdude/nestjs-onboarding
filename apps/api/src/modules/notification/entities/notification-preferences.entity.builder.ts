import { generateUuid } from '@wisemen/nestjs-common'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import type { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class NotificationPreferencesBuilder {
  private readonly notificationPreferences: NotificationPreferences

  constructor () {
    this.notificationPreferences = new NotificationPreferences()
    this.notificationPreferences.uuid = generateUuid()
    this.notificationPreferences.userUuid = generateUuid()
    this.notificationPreferences.types = []
    this.notificationPreferences.channel = NotificationChannel.APP
    this.notificationPreferences.isEnabled = true
  }

  withUserUuid (userUuid: UserUuid): this {
    this.notificationPreferences.userUuid = userUuid
    return this
  }

  withTypes (types: NotificationType[]): this {
    this.notificationPreferences.types = types
    return this
  }

  withChannel (channel: NotificationChannel): this {
    this.notificationPreferences.channel = channel
    return this
  }

  withIsEnabled (isEnabled: boolean): this {
    this.notificationPreferences.isEnabled = isEnabled
    return this
  }

  build (): NotificationPreferences {
    return this.notificationPreferences
  }
}
