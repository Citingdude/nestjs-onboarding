import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { GetMyNotificationsController } from './get-my-notifications.controller.js'
import { GetMyNotificationsUseCase } from './get-my-notifications.use-case.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { LocalizationModule } from '#src/modules/localization/modules/localization.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserNotification]),
    LocalizationModule
  ],
  controllers: [GetMyNotificationsController],
  providers: [GetMyNotificationsUseCase]
})
export class GetMyNotificationsModule {}
