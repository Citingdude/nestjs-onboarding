import '#src/modules/opentelemetry/instrumentation.js'
import { NestFactory } from '@nestjs/core'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import type { INestApplicationContext } from '@nestjs/common'
import { PgBossWorkerModule } from '@wisemen/pgboss-nestjs-job'
import { ConfigService } from '@nestjs/config'
import { sslHelper } from '@wisemen/nestjs-typeorm'
import { WorkerContainer } from '@wisemen/app-container/fastify'
import { captureException } from '@wisemen/opentelemetry'
import { WorkerModuleFactory } from './worker.factory.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

const VALID_QUEUE_NAMES = Object.values(QueueName)

const argsBuilder = yargs(hideBin(process.argv))
  .option('queue', {
    alias: 'q',
    type: 'string',
    array: true,
    description: 'One or more queue names to handle',
    choices: VALID_QUEUE_NAMES,
    demandOption: true
  })
  .option('concurrency', {
    alias: 'c',
    type: 'number',
    description: 'The number of jobs to process concurrently',
    default: 1
  })
  .option('interval', {
    alias: 'i',
    type: 'number',
    description: 'The interval in milliseconds to poll for new jobs',
    default: 2_000
  })
  .option('supervise', {
    alias: 's',
    type: 'boolean',
    description: 'Configures this worker to be a pgboss supervisor, typically only one should exist',
    default: false
  })
  .example('$0 --queue system --queue user-notification --concurrency 4 --interval 2000', 'Two queues using shared defaults')
  .example('$0 --queue system --queue user-notification --concurrency 4 --concurrency.system 8 --interval.user-notification 5000', 'Override selected queue settings')
  .example('$0 --queue system --supervise', 'Run a system queue worker with supervision enabled')

for (const queueName of VALID_QUEUE_NAMES) {
  argsBuilder
    .option(`concurrency-${queueName}`, {
      type: 'number',
      description: `Override the number of jobs to process concurrently for the ${queueName} queue`
    })
    .option(`interval-${queueName}`, {
      type: 'number',
      description: `Override the interval in milliseconds to poll for new jobs for the ${queueName} queue`
    })
}

const args = await argsBuilder
  .help()
  .argv

const unvalidatedQueueNames = Array.from(new Set(args.queue))

if (unvalidatedQueueNames.some(queueName => !VALID_QUEUE_NAMES.includes(queueName))) {
  throw new Error(`One or more queues not found: ${unvalidatedQueueNames.join(', ')}`)
}
const queueNames = unvalidatedQueueNames as QueueName[]

class Worker extends WorkerContainer {
  private static readonly MULTIPLIER = 4

  async bootstrap (): Promise<INestApplicationContext> {
    const queues = queueNames.map((queueName) => {
      const concurrency = args[`concurrency-${queueName}`] as number ?? args.concurrency
      const interval = args[`interval-${queueName}`] as number ?? args.interval

      return {
        queueName,
        concurrency,
        batchSize: concurrency * Worker.MULTIPLIER,
        fetchRefreshThreshold: concurrency * Worker.MULTIPLIER,
        pollInterval: interval ?? args.interval
      }
    })

    const pgbossModule = PgBossWorkerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        queues,
        pgBossOptions: {
          host: config.getOrThrow('DB_HOST'),
          port: config.getOrThrow('DB_PORT'),
          user: config.getOrThrow('DB_USERNAME'),
          password: config.getOrThrow('DB_PASSWORD'),
          database: config.getOrThrow('DB_NAME'),
          ssl: sslHelper(config.getOrThrow('DB_SSL')),
          supervise: args.supervise
        },
        onClientError: (e) => {
          captureException(e)
          // eslint-disable-next-line no-console
          console.error(e)
          process.exit(1)
        }
      })
    })

    const workerModule = WorkerModuleFactory.create(queueNames, pgbossModule)
    return await NestFactory.createApplicationContext(workerModule)
  }
}

const _worker = new Worker()
