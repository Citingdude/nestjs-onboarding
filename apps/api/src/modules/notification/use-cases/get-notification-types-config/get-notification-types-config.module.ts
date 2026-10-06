import { Module } from '@nestjs/common'
import { GetNotificationTypesConfigController } from './get-notification-types-config.controller.js'

@Module({
  controllers: [GetNotificationTypesConfigController]
})
export class GetNotificationTypesConfigModule {}
