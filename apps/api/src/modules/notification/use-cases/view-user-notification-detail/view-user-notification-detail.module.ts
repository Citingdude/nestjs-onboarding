import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewUserNotificationDetailController } from './view-user-notification-detail.controller.js'
import { ViewUserNotificationDetailUseCase } from './view-user-notification-detail.use-case.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'

@Module({
  imports: [TypeOrmModule.forFeature([UserNotification])],
  providers: [ViewUserNotificationDetailUseCase],
  controllers: [ViewUserNotificationDetailController]
})
export class ViewUserNotificationDetailModule {}
