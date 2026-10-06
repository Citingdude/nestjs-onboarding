import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { UpdateMyNotificationPreferencePresetCommand } from './update-my-notification-preference-preset.command.js'
import { NotificationPreferencePresetUpdatedEvent } from './notification-preference-preset-updated.event.js'
import { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@Injectable()
export class UpdateNotificationPresetPreferenceUseCase {
  constructor (
    private readonly datasource: DataSource,
    @InjectRepository(NotificationPreferencesPreset)
    private readonly notificationPresetPreference: TypeOrmRepository<NotificationPreferencesPreset>,
    private readonly authContext: AuthContext,
    private readonly eventEmitter: DomainEventEmitter
  ) {}

  async execute (
    command: UpdateMyNotificationPreferencePresetCommand
  ): Promise<void> {
    const userUuid = this.authContext.getUserUuidOrFail()

    await transaction(this.datasource, async () => {
      await this.notificationPresetPreference.upsert(
        { userUuid, preset: command.preset },
        { conflictPaths: { userUuid: true } }
      )
      await this.eventEmitter.emitOne(
        new NotificationPreferencePresetUpdatedEvent(userUuid, command.preset)
      )
    })
  }
}
