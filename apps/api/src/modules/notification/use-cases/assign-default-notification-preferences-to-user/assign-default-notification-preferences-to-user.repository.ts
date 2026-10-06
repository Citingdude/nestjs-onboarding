import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Injectable()
export class AssignDefaultNotificationPreferencesToUserRepository {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: TypeOrmRepository<User>,
    @InjectRepository(NotificationPreferences)
    private readonly preferencesRepository: TypeOrmRepository<NotificationPreferences>,
    @InjectRepository(NotificationPreferencesPreset)
    private readonly presetRepository: TypeOrmRepository<NotificationPreferencesPreset>
  ) {}

  async userExists (uuid: UserUuid): Promise<boolean> {
    return await this.userRepository.existsBy({ uuid })
  }

  async savePreferences (defaultPreferences: NotificationPreferences[]): Promise<void> {
    await this.preferencesRepository.createQueryBuilder()
      .insert()
      .into(NotificationPreferences)
      .values(defaultPreferences)
      .orIgnore()
      .execute()
  }

  async savePreset (preset: NotificationPreferencesPreset): Promise<void> {
    await this.presetRepository.insert(preset)
  }
}
