import { Injectable } from '@nestjs/common'
import { AndOrIgnore, InjectRepository, readonly, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { DataSource, IsNull, Not, type FindOperator } from 'typeorm'
import { ContainedIn } from '@wisemen/datewise'
import { MatchMultiSelect } from '@wisemen/scoped-filter'
import { ViewDomainEventLogIndexQuery } from './view-domain-event-log-index.query.js'
import { ViewDomainEventLogIndexResponse } from './view-domain-event-log-index.response.js'
import { TYPESENSE_DEFAULT_LIMIT } from '#src/modules/typesense/typesense.constant.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { DomainEventLogSource } from '#src/modules/domain-event-log/domain-event-log-source.enum.js'
import type { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

@Injectable()
export class ViewDomainEventLogIndexUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(DomainEventLog)
    private readonly logRepository: TypeOrmRepository<DomainEventLog>
  ) {}

  async getLogs (query: ViewDomainEventLogIndexQuery): Promise<ViewDomainEventLogIndexResponse> {
    const batchSize = query.pagination?.limit ?? TYPESENSE_DEFAULT_LIMIT
    let lastEntity: Partial<DomainEventLog> | undefined = undefined
    if (query.pagination?.key != null) {
      lastEntity = {
        uuid: query.pagination.key.uuid,
        createdAt: new Date(query.pagination.key.createdAt)
      }
    }

    const inRange = query.filter?.inRange?.parse()

    const logs = await readonly(this.dataSource, async () =>
      await this.logRepository.findNextBatch({
        where: {
          createdAt: inRange ? ContainedIn(inRange) : undefined,
          subjectType: MatchMultiSelect(query.filter?.subjectTypes),
          subjectId: query.filter?.subjectId,
          actorType: this.buildActorTypeOperators(query),
          actorId: MatchMultiSelect(query.filter?.actorIds)
        },
        order: {
          createdAt: 'DESC',
          uuid: 'DESC'
        }
      }, batchSize, lastEntity)
    )

    return new ViewDomainEventLogIndexResponse(logs)
  }

  private buildActorTypeOperators (
    query: ViewDomainEventLogIndexQuery
  ): FindOperator<DomainEventActorType> | undefined {
    const operators: (FindOperator<DomainEventActorType> | undefined)[] = [
      MatchMultiSelect(query.filter?.actorTypes)
    ]

    if (query.filter?.source === DomainEventLogSource.SYSTEM) {
      operators.push(IsNull())
    } else if (query.filter?.source === DomainEventLogSource.USER) {
      operators.push(Not(IsNull()))
    }

    return AndOrIgnore(...operators)
  }
}
