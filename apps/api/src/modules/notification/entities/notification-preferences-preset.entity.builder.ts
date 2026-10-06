import { generateUuid } from '@wisemen/nestjs-common'
import { NotificationPreferencesPreset } from './notification-preferences-preset.entity.js'
import { NotificationPreset } from '#src/modules/notification/enums/notification-preset.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class NotificationPreferencesPresetBuilder {
  private readonly preferencesPreset: NotificationPreferencesPreset

  constructor () {
    this.preferencesPreset = new NotificationPreferencesPreset()
    this.preferencesPreset.userUuid = generateUuid()
    this.preferencesPreset.preset = NotificationPreset.DEFAULT
  }

  withUserUuid (userUuid: UserUuid): this {
    this.preferencesPreset.userUuid = userUuid
    return this
  }

  withPreset (preset: NotificationPreset): this {
    this.preferencesPreset.preset = preset
    return this
  }

  build (): NotificationPreferencesPreset {
    return this.preferencesPreset
  }
}
