import { Injectable } from '@nestjs/common'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { RequestDomainEventLogExportCommand } from './request-domain-event-log-export.command.js'
import { RequestDomainEventLogExportResponse } from './request-domain-event-log-export.response.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import { ExportBuilder } from '#src/app/export/entities/export.entity.builder.js'
import { ExportType } from '#src/app/export/entities/export-type.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { ExportDomainEventLogJob } from '#src/modules/domain-event-log/use-cases/export-domain-event-log/export-domain-event-log.job.js'

@Injectable()
export class RequestDomainEventLogExportUseCase {
  constructor (
    private dataSource: DataSource,
    private scheduler: PgBossScheduler,
    @InjectRepository(Export)
    private exportRepository: TypeOrmRepository<Export>
  ) { }

  async execute (
    command: RequestDomainEventLogExportCommand,
    requestedByUserUuid: UserUuid
  ): Promise<RequestDomainEventLogExportResponse> {
    const exportRecord = new ExportBuilder()
      .withType(ExportType.DOMAIN_EVENT_LOG_CSV)
      .withRequestedByUserUuid(requestedByUserUuid)
      .build()

    await transaction(this.dataSource, async () => {
      await this.exportRepository.insert(exportRecord)
      await this.scheduler.scheduleJob(new ExportDomainEventLogJob({
        requestedByUserUuid,
        exportUuid: exportRecord.uuid,
        subjectTypes: command.subjectTypes,
        subjectId: command.subjectId,
        actorTypes: command.actorTypes,
        actorIds: command.actorIds,
        source: command.source,
        inRange: command.inRange?.parse().toString()
      }))
    })

    return new RequestDomainEventLogExportResponse(exportRecord.uuid)
  }
}
