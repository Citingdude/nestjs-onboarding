import { Module } from '@nestjs/common'
import { TodoUpdatedIntegrationSubscriber } from '#src/app/todo/use-cases/update-todo/integration/todo-updated.integration.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [TodoUpdatedIntegrationSubscriber]
})
export class TodoUpdatedIntegrationSubscriberModule {}
