import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { ReadStream } from 'typeorm/platform/PlatformTools.js'
import type { ExportDomainEventLogJobData } from './export-domain-event-log.job.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import { ExportStatus } from '#src/app/export/entities/export-status.enum.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { DomainEventLogSource } from '#src/modules/domain-event-log/domain-event-log-source.enum.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export type ExportDomainEventLogRecord = Pick<
  DomainEventLog,
  | 'uuid'
  | 'createdAt'
  | 'version'
  | 'source'
  | 'type'
  | 'subjectType'
  | 'subjectId'
  | 'content'
  | 'actorType'
  | 'actorId'
  | 'traceId'
>

@Injectable()
export class ExportDomainEventLogJobRepository {
  constructor (
    @InjectRepository(UserPreferences)
    private userPrefRepo: TypeOrmRepository<UserPreferences>,
    @InjectRepository(DomainEventLog)
    private logRepository: TypeOrmRepository<DomainEventLog>,
    @InjectRepository(Export)
    private exportRepository: TypeOrmRepository<Export>,
    @InjectRepository(File)
    private fileRepository: TypeOrmRepository<File>
  ) { }

  async findUserPreferences (userUuid: UserUuid): Promise<UserPreferences | null> {
    return this.userPrefRepo.findOneBy({ userUuid })
  }

  streamDomainEventLogs (filters: ExportDomainEventLogJobData): Promise<ReadStream> {
    const query = this.logRepository.createQueryBuilder('log')
      .select([
        'log.uuid AS uuid',
        'log.createdAt AS "createdAt"',
        'log.version AS version',
        'log.source AS source',
        'log.type AS type',
        'log.subjectType AS "subjectType"',
        'log.subjectId AS "subjectId"',
        'log.content AS content',
        'log.actorType AS "actorType"',
        'log.actorId AS "actorId"',
        'log.traceId AS "traceId"'
      ])
      .orderBy('log.createdAt', 'DESC')
      .addOrderBy('log.uuid', 'DESC')

    if (filters.inRange != null) {
      query.andWhere('log.createdAt <@ :inRange::tstzrange3', { inRange: filters.inRange })
    }

    if (filters.subjectTypes != null) {
      query.andWhereMatchMultiSelect('log.subjectType', filters.subjectTypes)
    }

    if (filters.subjectId != null) {
      query.andWhere('log.subjectId = :subjectId', { subjectId: filters.subjectId })
    }

    if (filters.actorTypes != null) {
      query.andWhereMatchMultiSelect('log.actorType', filters.actorTypes)
    }

    if (filters.actorIds != null) {
      query.andWhereMatchMultiSelect('log.actorId', filters.actorIds)
    }

    if (filters.source === DomainEventLogSource.SYSTEM) {
      query.andWhere('log.actorType IS NULL')
    } else if (filters.source === DomainEventLogSource.USER) {
      query.andWhere('log.actorType IS NOT NULL')
    }

    return query.stream()
  }

  async failExport (uuid: ExportUuid, message: string): Promise<void> {
    await this.exportRepository.update(uuid, {
      status: ExportStatus.FAILED,
      errorMessage: message
    })
  }

  async completeExport (uuid: ExportUuid, fileUuid: FileUuid): Promise<void> {
    await this.exportRepository.update(uuid, {
      status: ExportStatus.SUCCEEDED,
      fileUuid
    })
  }

  async insertFile (file: File): Promise<void> {
    await this.fileRepository.insert(file)
  }
}
