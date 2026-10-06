import { Module } from '@nestjs/common'
import { ContactCreatedIntegrationSubscriber } from './contact-created.integration.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [ContactCreatedIntegrationSubscriber]
})
export class ContactCreatedIntegrationSubscriberModule {}
