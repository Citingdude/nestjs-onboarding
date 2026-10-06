import type { DateTimeRangeDto } from '@wisemen/datewise'
import type { MultiSelectFilter } from '@wisemen/scoped-filter/dist/multi-select/multi-select-filter.js'
import { ViewDomainEventLogIndexFilterQuery, ViewDomainEventLogIndexPaginationQuery, ViewDomainEventLogIndexQuery } from './view-domain-event-log-index.query.js'
import type { ViewDomainEventLogIndexQueryKey } from './view-domain-event-log-index.query.key.js'
import type { DomainEventLogSource } from '#src/modules/domain-event-log/domain-event-log-source.enum.js'
import type { DomainEventSubjectTypeFilter } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import type { DomainEventActorTypeFilter } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

export class ViewDomainEventLogIndexQueryBuilder {
  private readonly query: ViewDomainEventLogIndexQuery

  constructor () {
    this.query = new ViewDomainEventLogIndexQuery()
  }

  withSubjectTypes (types: DomainEventSubjectTypeFilter): this {
    this.query.filter ??= new ViewDomainEventLogIndexFilterQuery()
    this.query.filter.subjectTypes = types
    return this
  }

  withSubjectId (id: string): this {
    this.query.filter ??= new ViewDomainEventLogIndexFilterQuery()
    this.query.filter.subjectId = id
    return this
  }

  withActorTypes (types: DomainEventActorTypeFilter): this {
    this.query.filter ??= new ViewDomainEventLogIndexFilterQuery()
    this.query.filter.actorTypes = types
    return this
  }

  withActorIds (ids: MultiSelectFilter<string>): this {
    this.query.filter ??= new ViewDomainEventLogIndexFilterQuery()
    this.query.filter.actorIds = ids
    return this
  }

  withSource (source: DomainEventLogSource): this {
    this.query.filter ??= new ViewDomainEventLogIndexFilterQuery()
    this.query.filter.source = source
    return this
  }

  withInRange (range: DateTimeRangeDto): this {
    this.query.filter ??= new ViewDomainEventLogIndexFilterQuery()
    this.query.filter.inRange = range
    return this
  }

  withLimit (limit: number): this {
    this.query.pagination ??= new ViewDomainEventLogIndexPaginationQuery()
    this.query.pagination.limit = limit
    return this
  }

  withKey (key: ViewDomainEventLogIndexQueryKey): this {
    this.query.pagination ??= new ViewDomainEventLogIndexPaginationQuery()
    this.query.pagination.key = key
    return this
  }

  build (): ViewDomainEventLogIndexQuery {
    return this.query
  }
}
