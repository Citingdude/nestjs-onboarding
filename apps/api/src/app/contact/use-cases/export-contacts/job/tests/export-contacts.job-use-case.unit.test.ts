import { Readable, Writable } from 'node:stream'
import { before, describe, it } from 'node:test'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { TestFileStorage } from '@wisemen/nestjs-file-storage'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { assert, createStubInstance } from 'sinon'
import type { ReadStream } from 'typeorm/platform/PlatformTools.js'
import { generateUuid } from '@wisemen/nestjs-common'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import { ExportSucceededEvent } from '#src/app/export/events/export-succeeded.event.js'
import { UserPreferencesBuilder } from '#src/app/user-preferences/entities/user-preferences.entity.builder.js'
import { ExportContactsJobRepository } from '#src/app/contact/use-cases/export-contacts/job/export-contacts-job.repository.js'
import { ExportContactsJobUseCase } from '#src/app/contact/use-cases/export-contacts/job/export-contacts.job-use-case.js'
import { ExportContactsJob } from '#src/app/contact/use-cases/export-contacts/job/export-contacts.job.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import { t } from '#src/modules/localization/helpers/translate.helper.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

describe('ExportContactsJobUseCase unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('writes the expected CSV rows and completes the export', async () => {
    const repository = createStubInstance(ExportContactsJobRepository)
    const fileStorage = createStubInstance(TestFileStorage)
    const eventEmitter = createStubInstance(DomainEventEmitter)
    const keyFactory = createStubInstance(FileStorageKeyFactory)

    const useCase = new ExportContactsJobUseCase(
      stubDataSource(),
      repository,
      fileStorage,
      eventEmitter,
      keyFactory
    )

    const contactA = new ContactBuilder()
      .withFirstName('Alice')
      .withLastName('Smith')
      .withEmail('alice@example.com')
      .withPhone('+32470000001')
      .build()
    const contactB = new ContactBuilder()
      .withFirstName('Bob')
      .withLastName('Jones')
      .withEmail('bob@example.com')
      .withPhone('+32470000002')
      .build()

    const uploadedBuffer = createUploadWritable(fileStorage)
    const fileStorageKey = 'exports/contacts.csv'
    const job = new ExportContactsJob({
      requestedByUserUuid: generateUuid<UserUuid>(),
      exportUuid: generateUuid<ExportUuid>()
    })

    repository.findUserPreferences.resolves(new UserPreferencesBuilder()
      .withLanguage(Locale.EN_US)
      .build()
    )
    repository.streamContacts.resolves(Readable.from([
      contactA,
      contactB
    ]) as ReadStream)
    keyFactory.createFromFile.returns(fileStorageKey)

    await useCase.execute(job.data)

    const lines = uploadedBuffer().toString('utf-8')
      .split('\n')
      .filter(line => line.length > 0)

    expect(lines).toStrictEqual([
      [
        t('csv.contacts.uuid', { lang: Locale.EN_US }),
        t('csv.contacts.first-name', { lang: Locale.EN_US }),
        t('csv.contacts.last-name', { lang: Locale.EN_US }),
        t('csv.contacts.email', { lang: Locale.EN_US }),
        t('csv.contacts.phone', { lang: Locale.EN_US })
      ].join(';'),
      `${contactA.uuid};Alice;Smith;alice@example.com;+32470000001`,
      `${contactB.uuid};Bob;Jones;bob@example.com;+32470000002`
    ])

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

  it('serializes null contact fields as empty CSV cells', async () => {
    const repository = createStubInstance(ExportContactsJobRepository)
    const fileStorage = createStubInstance(TestFileStorage)
    const eventEmitter = createStubInstance(DomainEventEmitter)
    const keyFactory = createStubInstance(FileStorageKeyFactory)

    const useCase = new ExportContactsJobUseCase(
      stubDataSource(),
      repository,
      fileStorage,
      eventEmitter,
      keyFactory
    )

    const contact = new ContactBuilder()
      .withFirstName(null)
      .withLastName(null)
      .withEmail(null)
      .withPhone(null)
      .build()

    const uploadedBuffer = createUploadWritable(fileStorage)
    const fileStorageKey = 'exports/contacts-null.csv'
    const job = new ExportContactsJob({
      requestedByUserUuid: generateUuid<UserUuid>(),
      exportUuid: generateUuid<ExportUuid>()
    })

    repository.findUserPreferences.resolves(null)
    repository.streamContacts.resolves(Readable.from([contact]) as ReadStream)
    keyFactory.createFromFile.returns(fileStorageKey)

    await useCase.execute(job.data)

    const lines = uploadedBuffer().toString('utf-8')
      .split('\n')
      .filter(line => line.length > 0)

    expect(lines).toStrictEqual([
      [
        t('csv.contacts.uuid', { lang: Locale.EN_US }),
        t('csv.contacts.first-name', { lang: Locale.EN_US }),
        t('csv.contacts.last-name', { lang: Locale.EN_US }),
        t('csv.contacts.email', { lang: Locale.EN_US }),
        t('csv.contacts.phone', { lang: Locale.EN_US })
      ].join(';'),
      `${contact.uuid};;;;`
    ])
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
