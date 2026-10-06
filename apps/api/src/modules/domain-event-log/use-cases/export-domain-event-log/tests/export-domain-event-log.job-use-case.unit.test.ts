import { Readable, Writable } from 'node:stream'
import { before, describe, it } from 'node:test'
import { expect } from 'expect'
import { CSV } from '@wisemen/csv'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { TestFileStorage } from '@wisemen/nestjs-file-storage'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { assert, createStubInstance } from 'sinon'
import type { ReadStream } from 'typeorm/platform/PlatformTools.js'
import { generateUuid } from '@wisemen/nestjs-common'
import { ExportSucceededEvent } from '#src/app/export/events/export-succeeded.event.js'
import { UserPreferencesBuilder } from '#src/app/user-preferences/entities/user-preferences.entity.builder.js'
import { ExportDomainEventLogJobRepository } from '#src/modules/domain-event-log/use-cases/export-domain-event-log/export-domain-event-log-job.repository.js'
import { ExportDomainEventLogJobUseCase } from '#src/modules/domain-event-log/use-cases/export-domain-event-log/export-domain-event-log.job-use-case.js'
import { ExportDomainEventLogJob } from '#src/modules/domain-event-log/use-cases/export-domain-event-log/export-domain-event-log.job.js'
import { DomainEventLogBuilder } from '#src/modules/domain-event-log/domain-event-log.entity.builder.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import { t } from '#src/modules/localization/helpers/translate.helper.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

type ExportDomainEventLogCsvRow = Record<string, string>

describe('ExportDomainEventLogJobUseCase unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('writes the expected CSV row and completes the export', async () => {
    const repository = createStubInstance(ExportDomainEventLogJobRepository)
    const fileStorage = createStubInstance(TestFileStorage)
    const eventEmitter = createStubInstance(DomainEventEmitter)
    const keyFactory = createStubInstance(FileStorageKeyFactory)

    const useCase = new ExportDomainEventLogJobUseCase(
      stubDataSource(),
      repository,
      fileStorage,
      eventEmitter,
      keyFactory
    )

    const log = new DomainEventLogBuilder()
      .withCreatedAt(new Date())
      .withVersion(3)
      .withSource('system')
      .withType(DomainEventType.CONTACT_CREATED)
      .withSubjectType(DomainEventSubjectType.USER)
      .withSubjectId(generateUuid())
      .withActorType(DomainEventActorType.USER)
      .withActorId(generateUuid())
      .withContent({ marker: 'included-event-log', value: 'with "quotes"' })
      .withTraceId('trace-1')
      .build()

    const uploadedBuffer = createUploadWritable(fileStorage)
    const fileStorageKey = 'exports/domain-event-log.csv'
    const job = new ExportDomainEventLogJob({
      requestedByUserUuid: generateUuid<UserUuid>(),
      exportUuid: generateUuid<ExportUuid>()
    })

    repository.findUserPreferences.resolves(new UserPreferencesBuilder()
      .withLanguage(Locale.EN_US)
      .build()
    )
    repository.streamDomainEventLogs.resolves(Readable.from([log]) as ReadStream)
    keyFactory.createFromFile.returns(fileStorageKey)

    await useCase.execute(job.data)

    const rows = CSV.decode(uploadedBuffer().toString('utf-8')) as ExportDomainEventLogCsvRow[]

    expect(rows).toHaveLength(1)
    expect(Object.keys(rows[0])).toEqual([
      t('csv.event-logs.uuid', { lang: Locale.EN_US }),
      t('csv.event-logs.created-at', { lang: Locale.EN_US }),
      t('csv.event-logs.version', { lang: Locale.EN_US }),
      t('csv.event-logs.source', { lang: Locale.EN_US }),
      t('csv.event-logs.type', { lang: Locale.EN_US }),
      t('csv.event-logs.subject-type', { lang: Locale.EN_US }),
      t('csv.event-logs.subject-id', { lang: Locale.EN_US }),
      t('csv.event-logs.actor-type', { lang: Locale.EN_US }),
      t('csv.event-logs.actor-id', { lang: Locale.EN_US }),
      t('csv.event-logs.content', { lang: Locale.EN_US }),
      t('csv.event-logs.trace-id', { lang: Locale.EN_US })
    ])
    expect(rows[0]).toMatchObject({
      [t('csv.event-logs.uuid', { lang: Locale.EN_US })]: log.uuid,
      [t('csv.event-logs.created-at', { lang: Locale.EN_US })]: log.createdAt.toISOString(),
      [t('csv.event-logs.version', { lang: Locale.EN_US })]: String(log.version),
      [t('csv.event-logs.source', { lang: Locale.EN_US })]: log.source,
      [t('csv.event-logs.type', { lang: Locale.EN_US })]: log.type,
      [t('csv.event-logs.subject-type', { lang: Locale.EN_US })]: log.subjectType ?? '',
      [t('csv.event-logs.subject-id', { lang: Locale.EN_US })]: log.subjectId ?? '',
      [t('csv.event-logs.actor-type', { lang: Locale.EN_US })]: log.actorType ?? '',
      [t('csv.event-logs.actor-id', { lang: Locale.EN_US })]: log.actorId ?? '',
      [t('csv.event-logs.trace-id', { lang: Locale.EN_US })]: log.traceId ?? ''
    })
    const contentColumn = t('csv.event-logs.content', { lang: Locale.EN_US })
    const content = getRequiredValue(rows[0], contentColumn)

    expect(JSON.parse(content)).toEqual(log.content)

    const insertedFile = repository.insertFile.firstCall.args[0]

    assert.calledOnceWithExactly(fileStorage.createUploadWritable, fileStorageKey)
    assert.calledOnceWithExactly(repository.completeExport, job.data.exportUuid, insertedFile.uuid)
    expect(insertedFile.isUploadConfirmed).toBe(true)
    expect(eventEmitter).toHaveEmitted(
      new ExportSucceededEvent(
        job.data.exportUuid,
        insertedFile.uuid,
        job.data.requestedByUserUuid
      )
    )
  })
})

function createUploadWritable (
  fileStorage: ReturnType<typeof createStubInstance<TestFileStorage>>
): () => Buffer {
  const chunks: Buffer[] = []

  fileStorage.createUploadWritable.callsFake(() => new Writable({
    write (chunk, _encoding, callback): void {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string))
      callback()
    }
  }))

  return () => Buffer.concat(chunks)
}

function getRequiredValue (row: ExportDomainEventLogCsvRow, key: string): string {
  const value = row[key]

  if (value == null) {
    throw new Error(`Expected "${key}" column to be present`)
  }

  return value
}
