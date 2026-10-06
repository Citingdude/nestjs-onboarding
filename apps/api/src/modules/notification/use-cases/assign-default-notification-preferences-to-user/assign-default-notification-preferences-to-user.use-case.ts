import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { AssignDefaultNotificationPreferencesToUserRepository } from './assign-default-notification-preferences-to-user.repository.js'
import { DefaultNotificationPreferencesAssignedToUserEvent } from './default-notification-preferences-assigned-to-user.event.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationPreferencesBuilder } from '#src/modules/notification/entities/notification-preferences.entity.builder.js'
import { NotificationPreset } from '#src/modules/notification/enums/notification-preset.enum.js'
import { getDefaultTypesOfChannel } from '#src/modules/notification/notification-types-config.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'
import { NotificationPreferencesPresetBuilder } from '#src/modules/notification/entities/notification-preferences-preset.entity.builder.js'

@Injectable()
export class AssignDefaultNotificationPreferencesToUserUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: AssignDefaultNotificationPreferencesToUserRepository
  ) {}

  async assignDefaultPreferences (forUserUuid: UserUuid): Promise<void> {
    if (!await this.repository.userExists(forUserUuid)) {
      throw new UserNotFoundError(forUserUuid)
    }

    const defaultPreferences = this.createDefaultPreferences(forUserUuid)
    const event = new DefaultNotificationPreferencesAssignedToUserEvent(forUserUuid)
    const defaultPreset = new NotificationPreferencesPresetBuilder()
      .withUserUuid(forUserUuid)
      .withPreset(NotificationPreset.DEFAULT)
      .build()

    await transaction(this.dataSource, async () => {
      await this.repository.savePreferences(defaultPreferences)
      await this.repository.savePreset(defaultPreset)
      await this.eventEmitter.emitOne(event)
    })
  }

  private createDefaultPreferences (forUserUuid: UserUuid): NotificationPreferences[] {
    const channels = Object.values(NotificationChannel)
    const defaultPreferences: NotificationPreferences[] = []

    for (const channel of channels) {
      const defaultTypesForChannel = getDefaultTypesOfChannel(channel)

      const newNotificationPreference = new NotificationPreferencesBuilder()
        .withUserUuid(forUserUuid)
        .withChannel(channel)
        .withTypes(defaultTypesForChannel)
        .build()

      defaultPreferences.push(newNotificationPreference)
    }

    return defaultPreferences
  }
}
