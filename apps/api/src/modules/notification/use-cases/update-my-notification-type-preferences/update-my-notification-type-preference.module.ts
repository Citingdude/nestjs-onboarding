import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { UpdateMyNotificationTypePreferenceController } from './update-my-notification-type-preference.controller.js'
import { UpdateMyNotificationPreferenceTypeUseCase } from './update-my-notification-type-preference.use-case.js'
import { NotificationPreferences } from '#src/modules/notification/entities/notification-preferences.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationPreferences])
  ],
  controllers: [UpdateMyNotificationTypePreferenceController],
  providers: [UpdateMyNotificationPreferenceTypeUseCase]
})
export class UpdateMyNotificationTypePreferenceModule {}
