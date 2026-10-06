import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { AssignDefaultNotificationPreferencesToUserUseCase } from './assign-default-notification-preferences-to-user.use-case.js'
import { AssignDefaultNotificationPreferencesToUserRepository } from './assign-default-notification-preferences-to-user.repository.js'
import { AssignDefaultNotificationPreferencesToUserJobHandler } from './assign-default-notification-preferences-to-user.job-handler.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      NotificationPreferences,
      NotificationPreferencesPreset
    ])
  ],
  providers: [
    AssignDefaultNotificationPreferencesToUserJobHandler,
    AssignDefaultNotificationPreferencesToUserUseCase,
    AssignDefaultNotificationPreferencesToUserRepository
  ]
})
export class AssignDefaultNotificationPreferencesToUserJobModule {}
