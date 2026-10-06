import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { UpdateMyChannelNotificationPreferenceCommand } from './update-my-channel-notification-preference.command.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@Injectable()
export class UpdateMyChannelNotificationPreferenceUseCase {
  constructor (
    @InjectRepository(NotificationPreferences)
    private readonly notificationPreferencesRepository: TypeOrmRepository<NotificationPreferences>,
    private readonly authContext: AuthContext
  ) {}

  async execute (
    command: UpdateMyChannelNotificationPreferenceCommand
  ): Promise<void> {
    await this.notificationPreferencesRepository.update(
      {
        userUuid: this.authContext.getUserUuidOrFail(),
        channel: command.channel
      },
      { isEnabled: command.isEnabled }
    )
  }
}
