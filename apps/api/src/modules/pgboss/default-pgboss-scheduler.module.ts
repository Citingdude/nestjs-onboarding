import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { sslHelper } from '@wisemen/nestjs-typeorm'
import { captureException } from '@wisemen/opentelemetry'
import { PgBossSchedulerModule } from '@wisemen/pgboss-nestjs-job'

@Module({
  imports: [PgBossSchedulerModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      pgBossOptions: {
        host: config.getOrThrow('DB_HOST'),
        port: config.getOrThrow('DB_PORT'),
        user: config.getOrThrow('DB_USERNAME'),
        password: config.getOrThrow('DB_PASSWORD'),
        database: config.getOrThrow('DB_NAME'),
        ssl: sslHelper(config.getOrThrow('DB_SSL')),
        supervise: false
      },
      onClientError: (e) => {
        captureException(e)
        // eslint-disable-next-line no-console
        console.error(e)
        throw e
      }
    })
  })],
  exports: [PgBossSchedulerModule]
})
export class DefaultPgBossSchedulerModule {}
