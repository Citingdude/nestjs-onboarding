import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { MarkNotificationAsReadController } from './mark-notification-as-read.controller.js'
import { MarkNotificationAsReadUseCase } from './mark-notification-as-read.use-case.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserNotification])
  ],
  controllers: [
    MarkNotificationAsReadController
  ],
  providers: [
    MarkNotificationAsReadUseCase
  ]
})
export class MarkNotificationAsReadModule {}
