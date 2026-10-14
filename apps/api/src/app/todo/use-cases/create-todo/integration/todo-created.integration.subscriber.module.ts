import { Module } from '@nestjs/common'
import { TodoCreatedIntegrationSubscriber } from '#src/app/todo/use-cases/create-todo/integration/todo-created.integration.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [TodoCreatedIntegrationSubscriber]
})
export class TodoCreatedIntegrationSubscriberModule {}
