import { Inject, Module, type DynamicModule, type OnApplicationBootstrap } from '@nestjs/common'
import { Trace } from '@wisemen/opentelemetry'
import { Duration } from '@wisemen/quantity'
import yargs from 'yargs'
import { ArchiveDomainEventLogsModule } from '#src/modules/domain-event-log/use-cases/archive-domain-event-logs/archive-domain-event-logs.module.js'
import { ArchiveDomainEventLogsUseCase } from '#src/modules/domain-event-log/use-cases/archive-domain-event-logs/archive-domain-event-logs.use-case.js'
import { CronjobType } from '#src/entrypoints/cronjob.type.js'

export const ARCHIVE_DOMAIN_EVENT_LOGS_CRONJOB_OPTIONS = Symbol('ARCHIVE_DOMAIN_EVENT_LOGS_CRONJOB_OPTIONS')
export interface ArchiveDomainEventLogsCronjobOptions {
  maxAge: Duration
  maxRange: Duration
}

@Module({})
export class ArchiveDomainEventLogsCronjobModule implements OnApplicationBootstrap {
  static async forRootAsync (argv: string[]): Promise<DynamicModule> {
    const options = await this.parseArgv(argv)

    return {
      module: ArchiveDomainEventLogsCronjobModule,
      imports: [ArchiveDomainEventLogsModule],
      providers: [
        {
          provide: ARCHIVE_DOMAIN_EVENT_LOGS_CRONJOB_OPTIONS,
          useValue: options
        }
      ]
    }
  }

  private static async parseArgv (argv: string[]): Promise<ArchiveDomainEventLogsCronjobOptions> {
    const args = await yargs(argv)
      .usage('$0', 'Run the archive domain event logs cronjob')
      .scriptName(`cronjob ${CronjobType.ARCHIVE_DOMAIN_EVENT_LOGS}`)
      .option('max-range', {
        type: 'string',
        description: 'Maximum duration for each archived chunk',
        demandOption: true,
        coerce: (value: string) => {
          const duration = new Duration(value)

          if (duration.isLessThan(Duration.ZERO)) {
            throw new Error('Archive chunk duration must be >= 0')
          }

          return duration
        }
      })
      .option('max-age', {
        type: 'string',
        description: 'Only archive logs older than this duration',
        default: '30days',
        coerce: (value: string) => {
          const duration = new Duration(value)

          if (duration.isLessThanOrEqualTo(Duration.ZERO)) {
            throw new Error('Archive age must be > 0')
          }

          return duration
        }
      })
      .strict()
      .showHelpOnFail(true)
      .exitProcess(false)
      .fail((message, error) => {
        throw error ?? new Error(message)
      })
      .help()
      .parseAsync()

    return { maxAge: args.maxAge, maxRange: args.maxRange }
  }

  constructor (
    private useCase: ArchiveDomainEventLogsUseCase,
    @Inject(ARCHIVE_DOMAIN_EVENT_LOGS_CRONJOB_OPTIONS)
    private options: ArchiveDomainEventLogsCronjobOptions
  ) {}

  @Trace()
  async onApplicationBootstrap (): Promise<void> {
    await this.useCase.execute(this.options.maxRange, this.options.maxAge)
  }
}
