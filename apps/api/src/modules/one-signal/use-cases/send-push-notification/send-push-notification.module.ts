import { Module } from '@nestjs/common'
import { SendPushNotificationUseCase } from './send-push-notification.use-case.js'
import { SendPushNotificationController } from './send-push-notification.controller.js'
import { OneSignalClientModule } from '#src/modules/one-signal-client/one-signal-client.module.js'

@Module({
  imports: [OneSignalClientModule],
  controllers: [SendPushNotificationController],
  providers: [SendPushNotificationUseCase]
})
export class SendPushNotificationModule {}
