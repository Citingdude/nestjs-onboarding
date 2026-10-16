import { Module } from '@nestjs/common'
import { TodoUncompletedIntegrationSubscriber } from '#src/app/todo/use-cases/uncomplete-todo/integration/todo-uncompleted.integration.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [TodoUncompletedIntegrationSubscriber]
})
export class TodoUncompletedIntegrationSubscriberModule {}
