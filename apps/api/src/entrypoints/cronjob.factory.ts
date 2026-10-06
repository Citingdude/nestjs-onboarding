import { exhaustiveCheck } from '@wisemen/nestjs-common'
import type { DynamicModule, Type } from '@nestjs/common'
import yargs from 'yargs'
import { ArchiveDomainEventLogsCronjobModule } from '#src/modules/domain-event-log/use-cases/archive-domain-event-logs/archive-domain-event-logs.cronjob.module.js'
import { CronjobType } from '#src/entrypoints/cronjob.type.js'

export interface CronjobArguments {
  type: CronjobType
  cronjobArgv: string[]
}

export class CronjobFactory {
  static async create (argv: string[]): Promise<DynamicModule | Type<unknown>> {
    const args = await this.parseCronjobArguments(argv)

    switch (args.type) {
      case CronjobType.ARCHIVE_DOMAIN_EVENT_LOGS:
        return await ArchiveDomainEventLogsCronjobModule.forRootAsync(args.cronjobArgv)
      default:
        return exhaustiveCheck(args.type)
    }
  }

  private static async parseCronjobArguments (argv: string[]): Promise<CronjobArguments> {
    const [typeArg, ...cronjobArgv] = argv

    const args = await yargs(typeArg == null ? [] : [typeArg])
      .usage('$0 <type> [args]', 'Run the specified cronjob')
      .scriptName('cronjob')
      .positional('type', {
        describe: 'Type of cronjob to run',
        type: 'string',
        choices: Object.values(CronjobType),
        demandOption: true
      })
      .strict()
      .showHelpOnFail(false)
      .exitProcess(false)
      .fail((message, error) => {
        throw error ?? new Error(message)
      })
      .help()
      .parseAsync()

    return { type: args.type, cronjobArgv }
  }
}
