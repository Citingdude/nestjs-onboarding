import { Module } from '@nestjs/common'
import { ContactDeletedIntegrationSubscriber } from './contact-deleted.integration.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [ContactDeletedIntegrationSubscriber]
})
export class ContactDeletedIntegrationSubscriberModule {}
