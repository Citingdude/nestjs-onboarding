import { Module } from '@nestjs/common'
import { ContactUpdatedIntegrationSubscriber } from './contact-updated.integration.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [ContactUpdatedIntegrationSubscriber]
})
export class ContactUpdatedIntegrationSubscriberModule {}
