import type { DateTimeRangeDto } from '@wisemen/datewise'
import type { MultiSelectFilter } from '@wisemen/scoped-filter/dist/multi-select/multi-select-filter.js'
import { RequestDomainEventLogExportCommand } from './request-domain-event-log-export.command.js'
import type { DomainEventLogSource } from '#src/modules/domain-event-log/domain-event-log-source.enum.js'
import type { DomainEventSubjectTypeFilter } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { DomainEventActorTypeFilter } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

export class RequestDomainEventLogExportCommandBuilder {
  private readonly command: RequestDomainEventLogExportCommand

  constructor () {
    this.command = new RequestDomainEventLogExportCommand()
  }

  withSubjectTypes (types: DomainEventSubjectTypeFilter): this {
    this.command.subjectTypes = types
    return this
  }

  withSubjectId (id: string): this {
    this.command.subjectId = id
    return this
  }

  withActorTypes (types: DomainEventActorTypeFilter): this {
    this.command.actorTypes = types
    return this
  }

  withActorIds (ids: MultiSelectFilter<string>): this {
    this.command.actorIds = ids
    return this
  }

  withSource (source: DomainEventLogSource): this {
    this.command.source = source
    return this
  }

  withInRange (range: DateTimeRangeDto): this {
    this.command.inRange = range
    return this
  }

  build (): RequestDomainEventLogExportCommand {
    return this.command
  }
}
