import { Injectable } from '@nestjs/common'
import { ContainedIn, timestamp, type DateTimeRange, type Timestamp } from '@wisemen/datewise'
import { InjectRepository } from '@wisemen/nestjs-typeorm'
import { LessThan, Repository } from 'typeorm'
import { ReadStream } from 'typeorm/platform/PlatformTools.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { DomainEventLogArchive } from '#src/modules/domain-event-log/domain-event-log-archive.entity.js'
import { File } from '#src/modules/files/entities/file.entity.js'

@Injectable()
export class ArchiveDomainEventLogsRepository {
  constructor (
    @InjectRepository(DomainEventLog)
    private domainEventLogRepository: Repository<DomainEventLog>,
    @InjectRepository(DomainEventLogArchive)
    private archiveRepository: Repository<DomainEventLogArchive>,
    @InjectRepository(File)
    private fileRepository: Repository<File>
  ) { }

  async findLatestArchive (): Promise<DomainEventLogArchive | null> {
    return await this.archiveRepository
      .createQueryBuilder('archive')
      .orderBy('upper(archive.range)', 'DESC')
      .addOrderBy('archive.created_at', 'DESC')
      .getOne()
  }

  async findOldestLogTimestamp (upperBound: Timestamp): Promise<Timestamp | null> {
    const log = await this.domainEventLogRepository.findOne({
      select: { createdAt: true },
      where: {
        createdAt: LessThan(upperBound.toDate())
      },
      order: {
        createdAt: 'ASC',
        uuid: 'ASC'
      }
    })

    return timestamp(log?.createdAt ?? null)
  }

  streamLogs (range: DateTimeRange): Promise<ReadStream> {
    return this.domainEventLogRepository.createQueryBuilder('log')
      .select([
        'log.uuid AS uuid',
        'log.createdAt AS "createdAt"',
        'log.version AS version',
        'log.source AS source',
        'log.type AS type',
        'log.subjectType AS "subjectType"',
        'log.subjectId AS "subjectId"',
        'log.actorType AS "actorType"',
        'log.actorId AS "actorId"',
        'log.content AS content',
        'log.traceId AS "traceId"'
      ])
      .where({ createdAt: ContainedIn(range) })
      .orderBy('log.createdAt', 'ASC')
      .addOrderBy('log.uuid', 'ASC')
      .stream()
  }

  async insertArchive (archive: DomainEventLogArchive): Promise<void> {
    await this.archiveRepository.insert(archive)
  }

  async insertFile (file: File): Promise<void> {
    await this.fileRepository.insert(file)
  }

  async deleteLogsInRange (range: DateTimeRange): Promise<void> {
    await this.domainEventLogRepository.delete({ createdAt: ContainedIn(range) })
  }
}
