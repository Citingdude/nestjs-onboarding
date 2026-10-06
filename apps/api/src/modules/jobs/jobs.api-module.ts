import { Module } from '@nestjs/common'
import { JobsApiModule as PgbossJobsApiModule } from '@wisemen/pgboss-nestjs-job'
import { DataSource } from 'typeorm'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@Module({
  imports: [
    PgbossJobsApiModule.forRootAsync({
      queueNames: Object.values(QueueName),
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => ({ dataSource }),
      controllers: {
        index: {
          handlerDecorators: [
            Permissions(Permission.JOBS_READ_INDEX),
            McpExclude('Job inspection is an operational administration endpoint.')
          ]
        },
        detail: {
          handlerDecorators: [
            Permissions(Permission.JOBS_READ_DETAIL),
            McpExclude('Job inspection is an operational administration endpoint.')
          ]
        }
      }
    })
  ]
})
export class JobsApiModule {}
