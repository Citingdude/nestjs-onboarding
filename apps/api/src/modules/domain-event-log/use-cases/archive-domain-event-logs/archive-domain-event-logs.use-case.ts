import { pipeline } from 'node:stream/promises'
import { Injectable } from '@nestjs/common'
import { DateTimeRange, timestamp, type Timestamp } from '@wisemen/datewise'
import { FileStorage } from '@wisemen/nestjs-file-storage'
import { readonly, transaction, tryAdvisoryLock } from '@wisemen/nestjs-typeorm'
import { Duration } from '@wisemen/quantity'
import { DataSource } from 'typeorm'
import { DomainEventLogArchiveBuilder } from '#src/modules/domain-event-log/domain-event-log-archive.entity.builder.js'
import { ArchiveDomainEventLogsRepository } from '#src/modules/domain-event-log/use-cases/archive-domain-event-logs/archive-domain-event-logs.repository.js'
import { ArchiveDomainEventLogsTransform } from '#src/modules/domain-event-log/use-cases/archive-domain-event-logs/archive-domain-event-logs.transform.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { MimeType } from '#src/modules/files/enums/mime-type.enum.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'

const LOCK_KEY = 17_842_300_01

@Injectable()
export class ArchiveDomainEventLogsUseCase {
  constructor (
    private dataSource: DataSource,
    private repository: ArchiveDomainEventLogsRepository,
    private fileStorage: FileStorage,
    private keyFactory: FileStorageKeyFactory
  ) { }

  async execute (maxRange: Duration, maxAge = Duration.ZERO): Promise<void> {
    await tryAdvisoryLock(this.dataSource, 'excl', LOCK_KEY, async () => {
      const runCeiling = timestamp().subtractDuration(maxAge)

      const latestArchive = await this.repository.findLatestArchive()
      let lowerBound = latestArchive?.range.until ?? timestamp.pastInfinity()

      while (true) {
        const nextRange = await this.findNextArchiveRange(lowerBound, runCeiling, maxRange)

        if (nextRange == null) {
          return
        }

        await this.archiveRange(nextRange)
        lowerBound = nextRange.until
      }
    })
  }

  private async findNextArchiveRange (
    lowerBound: Timestamp,
    runCeiling: Timestamp,
    maxRange: Duration
  ): Promise<DateTimeRange | null> {
    if (lowerBound.isPastInfinity()) {
      const oldestLogTimestamp = await this.repository.findOldestLogTimestamp(runCeiling)

      if (oldestLogTimestamp == null) {
        return null
      }

      return new DateTimeRange(
        timestamp.pastInfinity(),
        timestamp.min(oldestLogTimestamp.addDuration(maxRange), runCeiling)
      )
    }

    if (!lowerBound.isBefore(runCeiling)) {
      return null
    }

    const until = timestamp.min(
      lowerBound.addDuration(maxRange),
      runCeiling
    )

    return new DateTimeRange(lowerBound, until)
  }

  private async archiveRange (range: DateTimeRange): Promise<void> {
    const fileName = this.buildFileName(range)
    const file = new FileBuilder()
      .withName(fileName)
      .withMimeType(MimeType.NDJSON)
      .build()

    file.key = this.keyFactory.createFromFile(file)

    await readonly(this.dataSource, async () => {
      const fetchLogs = await this.repository.streamLogs(range)
      const transform = new ArchiveDomainEventLogsTransform()
      const upload = this.fileStorage.createUploadWritable(file.key)

      await pipeline(fetchLogs, transform, upload)
    })

    file.isUploadConfirmed = true

    const archive = new DomainEventLogArchiveBuilder()
      .withRange(range)
      .withFileUuid(file.uuid)
      .build()

    try {
      await transaction(this.dataSource, async () => {
        await this.repository.insertFile(file)
        await this.repository.insertArchive(archive)
        await this.repository.deleteLogsInRange(range)
      })
    } catch (error) {
      await this.tryDeleteUploadedArchive(file.key)
      throw error
    }
  }

  private buildFileName (range: DateTimeRange): string {
    return `domain-event-logs__${this.formatRangeBound(range.from)}__${this.formatRangeBound(range.until)}.ndjson`
  }

  private formatRangeBound (bound: Timestamp): string {
    if (bound.isPastInfinity()) {
      return '-infinity'
    }

    if (bound.isFutureInfinity()) {
      return 'infinity'
    }

    return bound.toISOString().replaceAll(':', '-')
  }

  private async tryDeleteUploadedArchive (key: string): Promise<void> {
    try {
      await this.fileStorage.delete(key)
    } catch {
      // Ignore cleanup failures and preserve the original error.
    }
  }
}
