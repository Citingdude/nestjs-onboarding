import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { MarkNotificationAsUnreadController } from './mark-notification-as-unread.controller.js'
import { MarkNotificationAsUnreadUseCase } from './mark-notification-as-unread.use-case.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserNotification])
  ],
  controllers: [
    MarkNotificationAsUnreadController
  ],
  providers: [
    MarkNotificationAsUnreadUseCase
  ]
})
export class MarkNotificationAsUnreadModule {}
