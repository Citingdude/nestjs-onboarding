import { Injectable } from '@nestjs/common'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { ExportContactsJob } from './job/export-contacts.job.js'
import { ExportContactsResponse } from './export-contacts.response.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import { ExportType } from '#src/app/export/entities/export-type.enum.js'
import { ExportBuilder } from '#src/app/export/entities/export.entity.builder.js'

@Injectable()
export class ExportContactsUseCase {
  constructor (
    private dataSource: DataSource,
    private scheduler: PgBossScheduler,
    @InjectRepository(Export)
    private exportRepository: TypeOrmRepository<Export>
  ) {}

  async execute (requestedByUserUuid: UserUuid): Promise<ExportContactsResponse> {
    const exportRecord = new ExportBuilder()
      .withType(ExportType.CONTACT_CSV)
      .withRequestedByUserUuid(requestedByUserUuid)
      .build()

    await transaction(this.dataSource, async () => {
      await this.exportRepository.insert(exportRecord)
      await this.scheduler.scheduleJob(new ExportContactsJob({
        requestedByUserUuid,
        exportUuid: exportRecord.uuid
      }))
    })

    return new ExportContactsResponse(exportRecord.uuid)
  }
}
