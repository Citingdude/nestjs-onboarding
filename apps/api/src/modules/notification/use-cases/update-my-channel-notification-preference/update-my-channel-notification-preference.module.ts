import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { UpdateMyChannelNotificationPreferenceController } from './update-my-channel-notification-preference.controller.js'
import { UpdateMyChannelNotificationPreferenceUseCase } from './update-my-channel-notification-preference.use-case.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreferences])],
  controllers: [UpdateMyChannelNotificationPreferenceController],
  providers: [UpdateMyChannelNotificationPreferenceUseCase]
})
export class UpdateMyChannelNotificationPreferenceModule {}
