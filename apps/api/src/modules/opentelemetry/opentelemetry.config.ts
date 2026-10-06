import { ConfigService } from '@nestjs/config'
import { getOtelServiceName, startOpentelemetryMetrics, startOpentelemetryTracing } from '@wisemen/opentelemetry'
import { EnvType } from '#src/modules/config/env.enum.js'

export function bootstrapOtelTracing () {
  const config = new ConfigService()
  const env = config.getOrThrow<string>('NODE_ENV')

  startOpentelemetryTracing({
    env,
    enabled: env !== EnvType.TEST && env !== EnvType.LOCAL,
    serviceName: getOtelServiceName(),
    url: config.get<string>('SIGNOZ_TRACE_ENDPOINT'),
    auth: {
      type: config.get<string>('SIGNOZ_AUTH'),
      key: config.get<string>('SIGNOZ_KEY') ?? config.get<string>('SIGNOZ_INGESTION_KEY')
    }
  })
}

export function bootstrapOtelMetrics () {
  const config = new ConfigService()
  const env = config.getOrThrow<string>('NODE_ENV')

  startOpentelemetryMetrics({
    env,
    enabled: env !== EnvType.TEST && env !== EnvType.LOCAL,
    serviceName: getOtelServiceName(),
    url: config.get<string>('SIGNOZ_METRICS_ENDPOINT'),
    auth: {
      type: config.get<string>('SIGNOZ_AUTH'),
      key: config.get<string>('SIGNOZ_KEY') ?? config.get<string>('SIGNOZ_INGESTION_KEY')
    }
  })
}
