import { DateTimeRange, timestamp } from '@wisemen/datewise'
import { generateUuid } from '@wisemen/nestjs-common'
import { DomainEventLogArchive } from './domain-event-log-archive.entity.js'
import type { DomainEventLogArchiveUuid } from './domain-event-log-archive.uuid.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class DomainEventLogArchiveBuilder {
  private archive: DomainEventLogArchive

  constructor () {
    this.archive = new DomainEventLogArchive()
    this.archive.uuid = generateUuid()
    this.archive.createdAt = new Date()
    this.archive.updatedAt = new Date()
    this.archive.range = new DateTimeRange(timestamp.pastInfinity(), timestamp())
    this.archive.fileUuid = generateUuid()
  }

  withUuid (uuid: DomainEventLogArchiveUuid): this {
    this.archive.uuid = uuid
    return this
  }

  withCreatedAt (date: Date): this {
    this.archive.createdAt = date
    return this
  }

  withUpdatedAt (date: Date): this {
    this.archive.updatedAt = date
    return this
  }

  withRange (range: DateTimeRange): this {
    this.archive.range = range
    return this
  }

  withFileUuid (fileUuid: FileUuid): this {
    this.archive.fileUuid = fileUuid
    return this
  }

  build (): DomainEventLogArchive {
    return this.archive
  }
}
