import type { DynamicModule, Type } from '@nestjs/common'
import { NatsClient, NatsQueueModule } from '@wisemen/nestjs-nats'
import { exhaustiveCheck } from '@wisemen/nestjs-common'
import { AppModule } from '#src/app.module.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'
import { SystemQueueModule } from '#src/modules/queue-modules/system-queue.module.js'
import { DefaultNatsClientModule } from '#src/modules/nats/nats.client.module.js'

export class WorkerModuleFactory {
  static create (queueNames: QueueName[], pgbossModule: DynamicModule): DynamicModule {
    const imports: (DynamicModule | Type<unknown>)[] = [pgbossModule]

    for (const queueName of queueNames) {
      imports.push(this.getQueueModule(queueName))
    }

    return AppModule.forRoot(imports)
  }

  private static getQueueModule (queueName: QueueName): DynamicModule | Type<unknown> {
    switch (queueName) {
      case QueueName.SYSTEM:
        return SystemQueueModule
      case QueueName.NATS_OUTBOX:
        return NatsQueueModule.forRootAsync({
          imports: [DefaultNatsClientModule],
          inject: [NatsClient],
          useFactory: (client: NatsClient) => ({
            natsClient: client,
            queueName: QueueName.NATS_OUTBOX
          })
        })
      default: return exhaustiveCheck(queueName)
    }
  }
}
