import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { exhaustiveCheck } from '@wisemen/nestjs-common'
import { GetMyNotificationPreferencesResponse } from './get-my-notification-preferences.response.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { ALL_NOTIFICATION_PREFERENCES, DEFAULT_NOTIFICATION_PREFERENCES } from '#src/modules/notification/notification-types-config.js'
import { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'
import { NotificationPreset } from '#src/modules/notification/enums/notification-preset.enum.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Injectable()
export class GetMyNotificationPreferencesUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(NotificationPreferences)
    private readonly notificationPreferencesRepository: TypeOrmRepository<NotificationPreferences>,
    @InjectRepository(NotificationPreferencesPreset)
    private readonly userPresetRepo: TypeOrmRepository<NotificationPreferencesPreset>,
    private readonly authContext: AuthContext
  ) {}

  async execute (): Promise<GetMyNotificationPreferencesResponse> {
    const userUuid = this.authContext.getUserUuidOrFail()
    const [userPreset, userPreferences] = await readonly(this.dataSource, async () => {
      const userPreset = await this.userPresetRepo.findOneByOrFail({ userUuid })
      const userPreferences = await this.getNotificationPreferences(userPreset.preset, userUuid)

      return [userPreset, userPreferences] as const
    })

    return new GetMyNotificationPreferencesResponse(userPreferences, userPreset.preset)
  }

  private async getNotificationPreferences (preset: NotificationPreset, userUuid: UserUuid):
  Promise<NotificationPreferences[]> {
    switch (preset) {
      case NotificationPreset.ALL:
        return ALL_NOTIFICATION_PREFERENCES
      case NotificationPreset.DEFAULT:
        return DEFAULT_NOTIFICATION_PREFERENCES
      case NotificationPreset.CUSTOM:
        return await this.notificationPreferencesRepository.findBy({ userUuid })
      case NotificationPreset.NONE:
        return []
      default:
        exhaustiveCheck(preset)
    }
  }
}
