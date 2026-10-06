import { bootstrapOtelMetrics } from '#src/modules/opentelemetry/opentelemetry.config.js'
import { NestFactory } from '@nestjs/core'
import type { INestApplicationContext } from '@nestjs/common'
import { WorkerContainer } from '@wisemen/app-container/fastify'
import { OpentelemetryMetricsModule as OpenTelemetryMetricsModule } from '#src/modules/opentelemetry/opentelemetry-metrics.module.js'

bootstrapOtelMetrics()

class OpenTelemetryMetrics extends WorkerContainer {
  async bootstrap (): Promise<INestApplicationContext> {
    return await NestFactory.createApplicationContext(OpenTelemetryMetricsModule)
  }
}

const _metrics = new OpenTelemetryMetrics()
