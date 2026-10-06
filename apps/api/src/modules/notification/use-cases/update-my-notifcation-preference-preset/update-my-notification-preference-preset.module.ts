import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { UpdateMyNotificationPreferencePresetController } from './update-my-notification-preference-preset.controller.js'
import { UpdateNotificationPresetPreferenceUseCase } from './update-my-notification-preference-preset.use-case.js'
import { NotificationPreferencesPreset } from '#src/modules/notification/entities/notification-preferences-preset.entity.js'

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreferencesPreset])],
  controllers: [UpdateMyNotificationPreferencePresetController],
  providers: [UpdateNotificationPresetPreferenceUseCase]
})
export class UpdateMyNotificationPreferencePresetModule {}
