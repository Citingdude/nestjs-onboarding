import { describe, it } from 'node:test'
import { expect } from 'expect'
import { Test } from '@nestjs/testing'
import { PgBossWorkerModule } from '@wisemen/pgboss-nestjs-job'
import { ConfigService } from '@nestjs/config'
import { sslHelper } from '@wisemen/nestjs-typeorm'
import { toBoolean } from '@wisemen/nestjs-common'
import { WorkerModuleFactory } from '#src/entrypoints/worker.factory.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

describe('Workers test', () => {
  async function testWorkerStartup (queueName: QueueName): Promise<void> {
    const workerModule = WorkerModuleFactory.create([queueName], PgBossWorkerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        queues: [{ queueName }],
        pgBossOptions: {
          host: config.getOrThrow('DB_HOST'),
          port: config.getOrThrow('DB_PORT'),
          user: config.getOrThrow('DB_USERNAME'),
          password: config.getOrThrow('DB_PASSWORD'),
          database: config.getOrThrow('DB_NAME'),
          ssl: sslHelper(config.getOrThrow('DB_SSL')),
          supervise: toBoolean(config.getOrThrow('PGBOSS_SUPERVISE'))
        }
      })
    }))
    const worker = await Test.createTestingModule({ imports: [workerModule] }).compile()

    return worker.close()
  }

  for (const queueName of Object.values(QueueName)) {
    it(`a ${queueName} worker starts successfully`, async () => {
      await expect(testWorkerStartup(queueName)).resolves.not.toThrow()
    })
  }
})
