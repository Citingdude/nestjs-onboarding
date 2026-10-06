import { pipeline } from 'node:stream/promises'
import { Injectable } from '@nestjs/common'
import { CSV } from '@wisemen/csv'
import { FileStorage } from '@wisemen/nestjs-file-storage'
import { readonly, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { captureException } from '@wisemen/opentelemetry'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { ExportContactsJobRepository } from './export-contacts-job.repository.js'
import type { ExportContactsJobData } from './export-contacts.job.js'
import { ExportFailedEvent } from '#src/app/export/events/export-failed.event.js'
import { ExportSucceededEvent } from '#src/app/export/events/export-succeeded.event.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { MimeType } from '#src/modules/files/enums/mime-type.enum.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import { t } from '#src/modules/localization/helpers/translate.helper.js'
import { ExportContactsTransform } from '#src/app/contact/use-cases/export-contacts/job/export-contacts.transform.js'

@Injectable()
export class ExportContactsJobUseCase {
  constructor (
    private dataSource: DataSource,
    private repository: ExportContactsJobRepository,
    private fileStorage: FileStorage,
    private eventEmitter: DomainEventEmitter,
    private keyFactory: FileStorageKeyFactory
  ) { }

  async execute (jobData: ExportContactsJobData): Promise<void> {
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

  private async tryGenerate (jobData: ExportContactsJobData): Promise<void> {
    const userUuid = jobData.requestedByUserUuid
    const userPreferences = await readonly(this.dataSource, async () =>
      await this.repository.findUserPreferences(userUuid)
    )
    const lang = userPreferences?.language ?? Locale.EN_US

    const file = new FileBuilder()
      .withName(t('csv.contacts.file-name', { lang }))
      .withMimeType(MimeType.CSV)
      .build()

    const fileStorageKey = this.keyFactory.createFromFile(file)
    file.key = fileStorageKey

    await readonly(this.dataSource, async () => {
      const fetchContacts = await this.repository.streamContacts()
      const translate = new ExportContactsTransform(lang)
      const encodeIntoCsv = CSV.encodeTransform()
      const uploadToFileStorage = this.fileStorage.createUploadWritable(file.key)

      await pipeline(fetchContacts, translate, encodeIntoCsv, uploadToFileStorage)
    })

    file.isUploadConfirmed = true
    const event = new ExportSucceededEvent(jobData.exportUuid, file.uuid, userUuid)

    await transaction(this.dataSource, async () => {
      await this.repository.insertFile(file)
      await this.repository.completeExport(jobData.exportUuid, file.uuid)
      await this.eventEmitter.emitOne(event)
    })
  }
}
