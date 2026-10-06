import { Module } from '@nestjs/common'
import { PgbossMetricsModule } from '@wisemen/pgboss-nestjs-job'
import { DataSource } from 'typeorm'
import { DefaultConfigModule } from '#src/modules/config/default-config.module.js'
import { DefaultTypeOrmModule } from '#src/modules/typeorm/default-typeorm.module.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

@Module({
  imports: [
    DefaultConfigModule,
    DefaultTypeOrmModule.forRootAsync({ migrationsRun: false }),
    PgbossMetricsModule.forRootAsync({
      inject: [DataSource],
      useFactory: function (dataSource: DataSource) {
        return {
          dataSource,
          queueNames: Object.values(QueueName)
        }
      }
    })
  ]
})
export class OpentelemetryMetricsModule {}
