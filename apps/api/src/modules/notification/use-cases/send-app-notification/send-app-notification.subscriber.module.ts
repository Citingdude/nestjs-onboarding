import { Module } from '@nestjs/common'
import { SendAppNotificationSubscriber } from './send-app-notification.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [SendAppNotificationSubscriber]
})
export class SendAppNotificationSubscriberModule {}
