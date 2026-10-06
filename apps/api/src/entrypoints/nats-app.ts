import '#src/modules/opentelemetry/instrumentation.js'
import type { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { WorkerContainer } from '@wisemen/app-container/fastify'
import { NatsAppModule } from '#src/modules/nats/nats-app.module.js'

export class NatsApp extends WorkerContainer {
  async bootstrap (): Promise<INestApplicationContext> {
    return await NestFactory.createApplicationContext(NatsAppModule)
  }
}

const _natsApp = new NatsApp()
