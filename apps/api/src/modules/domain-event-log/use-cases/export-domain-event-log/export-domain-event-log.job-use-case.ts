import { pipeline } from 'node:stream/promises'
import { Injectable } from '@nestjs/common'
import { CSV } from '@wisemen/csv'
import { captureException } from '@wisemen/opentelemetry'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { FileStorage } from '@wisemen/nestjs-file-storage'
import { readonly, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { ExportDomainEventLogJobRepository } from './export-domain-event-log-job.repository.js'
import type { ExportDomainEventLogJobData } from './export-domain-event-log.job.js'
import { ExportDomainEventLogTransform } from './export-domain-event-log.transform.js'
import { ExportFailedEvent } from '#src/app/export/events/export-failed.event.js'
import { ExportSucceededEvent } from '#src/app/export/events/export-succeeded.event.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { MimeType } from '#src/modules/files/enums/mime-type.enum.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import { t } from '#src/modules/localization/helpers/translate.helper.js'

@Injectable()
export class ExportDomainEventLogJobUseCase {
  constructor (
    private dataSource: DataSource,
    private repository: ExportDomainEventLogJobRepository,
    private fileStorage: FileStorage,
    private eventEmitter: DomainEventEmitter,
    private keyFactory: FileStorageKeyFactory
  ) { }

  async execute (jobData: ExportDomainEventLogJobData): Promise<void> {
    try {
      await this.tryGenerate(jobData)
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error'
      const event = new ExportFailedEvent(jobData.exportUuid, jobData.requestedByUserUuid, errMsg)

      await transaction(this.dataSource, async () => {
        await this.repository.failExport(jobData.exportUuid, errMsg)
        await this.eventEmitter.emitOne(event)
      })

      captureException(error)
    }
  }

  private async tryGenerate (job: ExportDomainEventLogJobData): Promise<void> {
    const userPreferences = await readonly(this.dataSource, async () =>
      await this.repository.findUserPreferences(job.requestedByUserUuid)
    )
    const lang = userPreferences?.language ?? Locale.EN_US

    const file = new FileBuilder()
      .withName(t('csv.event-logs.file-name', {
        lang,
        args: { date: new Date().toISOString() }
      }))
      .withMimeType(MimeType.CSV)
      .build()

    file.key = this.keyFactory.createFromFile(file)

    await readonly(this.dataSource, async () => {
      const fetchLogs = await this.repository.streamDomainEventLogs(job)
      const translate = new ExportDomainEventLogTransform(lang)
      const encodeIntoCsv = CSV.encodeTransform()
      const uploadToFileStorage = this.fileStorage.createUploadWritable(file.key)

      await pipeline(fetchLogs, translate, encodeIntoCsv, uploadToFileStorage)
    })

    file.isUploadConfirmed = true
    const event = new ExportSucceededEvent(job.exportUuid, file.uuid, job.requestedByUserUuid)

    await transaction(this.dataSource, async () => {
      await this.repository.insertFile(file)
      await this.repository.completeExport(job.exportUuid, file.uuid)
      await this.eventEmitter.emitOne(event)
    })
  }
}
