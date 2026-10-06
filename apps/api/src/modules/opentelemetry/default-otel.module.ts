import { Global, Module, type LogLevel } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getOtelServiceName, OtelLoggerModule } from '@wisemen/opentelemetry'

@Global()
@Module({
  imports: [OtelLoggerModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      const logLevels: LogLevel[] = ['fatal', 'error', 'warn', 'log']
      if (config.get('DEBUG') === 'true') {
        logLevels.push('debug', 'verbose')
      }

      return {
        serviceName: getOtelServiceName(),
        logLevels: logLevels,
        url: config.get<string>('SIGNOZ_LOG_ENDPOINT'),
        auth: {
          type: config.get<string>('SIGNOZ_AUTH'),
          key: config.get<string>('SIGNOZ_KEY') ?? config.get<string>('SIGNOZ_INGESTION_KEY')
        },
        env: config.getOrThrow<string>('NODE_ENV')
      }
    }
  })],
  exports: [OtelLoggerModule]
})
export class DefaultOtelModule {}
