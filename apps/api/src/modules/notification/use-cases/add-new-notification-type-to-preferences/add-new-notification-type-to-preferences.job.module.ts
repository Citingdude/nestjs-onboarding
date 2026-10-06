import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { Module } from '@nestjs/common'
import { AddNewNotificationTypeToPreferenceRepository } from './add-new-notification-type-to-preferences.repository.js'
import { AddNewNotificationTypeToPreferencesUseCase } from './add-new-notification-type-to-preferences.use-case.js'
import { AddNewNotificationTypeToPreferencesJobHandler } from './add-new-notification-type-to-preferences.job-handler.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationPreferences])
  ],
  providers: [
    AddNewNotificationTypeToPreferencesJobHandler,
    AddNewNotificationTypeToPreferenceRepository,
    AddNewNotificationTypeToPreferencesUseCase
  ],
  exports: []
})
export class AddNewNotificationTypeToPreferencesJobModule {}
