import { Module } from '@nestjs/common'
import { CreateOneSignalTokenModule } from './use-cases/create-one-signal-token/create-one-signal-token.module.js'
import { SendPushNotificationModule } from './use-cases/send-push-notification/send-push-notification.module.js'

@Module({
  imports: [CreateOneSignalTokenModule, SendPushNotificationModule]
})
export class OneSignalModule {}
