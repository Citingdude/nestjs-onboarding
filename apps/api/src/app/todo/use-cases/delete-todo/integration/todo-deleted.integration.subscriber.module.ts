import { Module } from '@nestjs/common'
import { TodoDeletedIntegrationSubscriber } from '#src/app/todo/use-cases/delete-todo/integration/todo-deleted.integration.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [TodoDeletedIntegrationSubscriber]
})
export class TodoDeletedIntegrationSubscriberModule {}
