import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { GetMyNotificationPreferencesController } from './get-my-notification-preferences.controller.js'
import { GetMyNotificationPreferencesUseCase } from './get-my-notification-preferences.use-case.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'
import { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationPreferences, NotificationPreferencesPreset])
  ],
  controllers: [GetMyNotificationPreferencesController],
  providers: [GetMyNotificationPreferencesUseCase]
})
export class GetMyNotificationPreferencesModule {}
