import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Any, Brackets } from 'typeorm'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { NotificationPrefrerencesUuid } from '#src/modules/notification/entities/notification-preferences.uuid.js'

export interface GetNotificationPreferencesResult {
  userUuid: UserUuid
}

@Injectable()
export class AddNewNotificationTypeToPreferenceRepository {
  constructor (
    @InjectRepository(NotificationPreferences)
    private readonly repository: TypeOrmRepository<NotificationPreferences>
  ) {}

  async enableNotificationTypeFor (
    preferenceUuids: string[],
    type: NotificationType
  ): Promise<void> {
    if (preferenceUuids.length === 0) {
      return
    }

    await this.repository.createQueryBuilder()
      .update(NotificationPreferences)
      .set({ types: () => `array_append(types, '${type}')` })
      .where('uuid IN (:...uuids)', { uuids: preferenceUuids })
      .execute()
  }

  async* findAllPreferenceUuids (
    channels: NotificationChannel[],
    batchSize: number
  ): AsyncGenerator<string[]> {
    if (channels.length === 0) {
      return
    }

    const generator = this.repository.findInBatches(
      {
        select: { uuid: true },
        where: { channel: Any(channels) }
      },
      batchSize
    )

    for await (const preferences of generator) {
      const preferenceUuids = preferences.map(preference => preference.uuid)
      yield preferenceUuids
    }
  }

  async* findUserPreferencesAlreadySubscribedToCategory (
    notificationCategory: string,
    channels: NotificationChannel[],
    batchesSize: number
  ): AsyncGenerator<string[]> {
    let key: string | undefined = undefined
    do {
      const query = this.repository.createQueryBuilder('user_notification_preference')
        .select('uuid')
        // Not optimal, but this code should only run at most once for any notification type
        .where(new Brackets((qb) => {
          qb.where(`array_to_string(types, ',') LIKE ':notificationCategory.%'`)
          qb.orWhere(`array_to_string(types, ',') LIKE '%,:notificationCategory.%'`)
        }), { notificationCategory })
        .andWhere('user_notification_preference.channel IN (:...channels)', { channels })
        .orderBy('user_notification_preference.uuid', 'ASC')
        .take(batchesSize)

      if (key !== undefined) {
        query.andWhere('user_notification_preference.uuid > :key', { key })
      }

      const preferences = await query.getRawMany<{ uuid: NotificationPrefrerencesUuid }>()

      if (preferences.length === 0) {
        return
      }

      const preferenceUuids = preferences.map(preference => preference.uuid)
      yield preferenceUuids

      key = preferenceUuids.at(-1)
    } while (key !== undefined)
  }
}
