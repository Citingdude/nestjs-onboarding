import { Module } from '@nestjs/common'
import { TodoCompletedIntegrationSubscriber } from '#src/app/todo/use-cases/complete-todo/integration/todo-completed.integration.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [TodoCompletedIntegrationSubscriber]
})
export class TodoCompletedIntegrationSubscriberModule {}
