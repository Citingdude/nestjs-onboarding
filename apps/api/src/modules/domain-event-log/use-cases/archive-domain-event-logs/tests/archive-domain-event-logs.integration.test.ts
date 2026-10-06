import { Writable } from 'node:stream'
import { after, afterEach, before, describe, it } from 'node:test'
import type { TestContext } from 'node:test'
import { assert } from 'sinon'
import { expect } from 'expect'
import Sinon from 'sinon'
import type { SinonStubbedInstance } from 'sinon'
import { DateTimeRange, timestamp } from '@wisemen/datewise'
import { FileStorage } from '@wisemen/nestjs-file-storage'
import { Duration } from '@wisemen/quantity'
import { In } from 'typeorm'
import { generateUuid } from '@wisemen/nestjs-common'
import { DomainEventLogArchiveBuilder } from '#src/modules/domain-event-log/domain-event-log-archive.entity.builder.js'
import { DomainEventLogArchive } from '#src/modules/domain-event-log/domain-event-log-archive.entity.js'
import { DomainEventLogBuilder } from '#src/modules/domain-event-log/domain-event-log.entity.builder.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { ArchiveDomainEventLogsModule } from '#src/modules/domain-event-log/use-cases/archive-domain-event-logs/archive-domain-event-logs.module.js'
import { ArchiveDomainEventLogsRepository } from '#src/modules/domain-event-log/use-cases/archive-domain-event-logs/archive-domain-event-logs.repository.js'
import { ArchiveDomainEventLogsUseCase } from '#src/modules/domain-event-log/use-cases/archive-domain-event-logs/archive-domain-event-logs.use-case.js'
import { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { MimeType } from '#src/modules/files/enums/mime-type.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

const ONE_HOUR = new Duration('1h')
const THIRTY_DAYS = new Duration('30days')

describe('Archive domain event logs integration tests', () => {
  let setup: TestSetup
  let useCase: ArchiveDomainEventLogsUseCase
  let repository: ArchiveDomainEventLogsRepository
  let fileStorage: SinonStubbedInstance<FileStorage>

  before(async () => {
    setup = await TestBench.setupModuleTest(ArchiveDomainEventLogsModule)
    useCase = setup.app.get(ArchiveDomainEventLogsUseCase)
    repository = setup.app.get(ArchiveDomainEventLogsRepository)
    fileStorage = Sinon.stub(setup.app.get(FileStorage))
  })

  after(async () => {
    await setup.teardown()
  })

  afterEach(async () => {
    fileStorage.createUploadWritable.resetHistory()
    fileStorage.createUploadWritable.resetBehavior()
    fileStorage.delete.resetHistory()
    fileStorage.delete.resetBehavior()

    const insertArchive = repository.insertArchive as typeof repository.insertArchive & {
      restore?: () => void
    }

    if (typeof insertArchive.restore === 'function') {
      insertArchive.restore()
    }

    await setup.entityManager.clear(DomainEventLogArchive)
    await setup.entityManager.clear(DomainEventLog)
    await setup.entityManager.query('SELECT pg_advisory_unlock_all()')
  })

  function mockNow ({ mock }: TestContext, now: string): void {
    mock.timers.enable({ apis: ['Date'], now: new Date(now) })
  }

  function stubCreateUploadWritable (
    uploadedBuffers: Uint8Array[]
  ): ReturnType<SinonStubbedInstance<FileStorage>['createUploadWritable']['callsFake']> {
    return fileStorage.createUploadWritable.callsFake(() => {
      const chunks: Buffer[] = []

      return new Writable({
        write (chunk, _encoding, callback): void {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string))
          callback()
        },
        final (callback): void {
          uploadedBuffers.push(Buffer.concat(chunks))
          callback()
        }
      })
    })
  }

  it('does nothing when there are no logs to archive', async () => {
    await useCase.execute(ONE_HOUR, Duration.ZERO)

    expect(fileStorage.createUploadWritable.called).toBe(false)
    expect(await setup.entityManager.count(DomainEventLogArchive)).toBe(0)
  })

  it('only archives logs older than the maximum age', async (context) => {
    mockNow(context, '2026-07-01T12:00:00.000Z')
    const archivedBuffers: Uint8Array[] = []
    stubCreateUploadWritable(archivedBuffers)

    const olderLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-05-31T12:00:00.000Z'))
      .withContent({ marker: 'older' })
      .build()
    const cutoffLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-06-01T12:00:00.000Z'))
      .withContent({ marker: 'cutoff' })
      .build()
    const newerLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-06-15T12:00:00.000Z'))
      .withContent({ marker: 'newer' })
      .build()

    await setup.entityManager.insert(DomainEventLog, [olderLog, cutoffLog, newerLog])

    await useCase.execute(new Duration('40days'), THIRTY_DAYS)

    const archives = await setup.entityManager.find(DomainEventLogArchive)
    const remainingLogs = await setup.entityManager.find(DomainEventLog)

    expect(archives).toHaveLength(1)
    expect(archives[0].range.until.toISOString()).toBe('2026-06-01T12:00:00.000Z')
    expect(archivedBuffers).toHaveLength(1)
    expect(remainingLogs.map(log => log.uuid))
      .toEqual(expect.arrayContaining([cutoffLog.uuid, newerLog.uuid]))
    expect(remainingLogs.map(log => log.uuid)).not.toContain(olderLog.uuid)
  })

  it('archives the first chunk from -infinity and removes archived logs', async (context) => {
    mockNow(context, '2026-07-01T12:00:00.000Z')
    const archivedBuffers: Uint8Array[] = []
    stubCreateUploadWritable(archivedBuffers)

    const firstLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-07-01T10:00:00.000Z'))
      .withActorType(DomainEventActorType.API_KEY)
      .withActorId(generateUuid())
      .withContent({ marker: 'first' })
      .build()
    const secondLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-07-01T10:30:00.000Z'))
      .withContent({ marker: 'second' })
      .build()
    const laterLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-07-01T11:30:00.000Z'))
      .withContent({ marker: 'later' })
      .build()

    await setup.entityManager.insert(DomainEventLog, [firstLog, secondLog, laterLog])

    await useCase.execute(ONE_HOUR)

    const archives = await setup.entityManager.find(DomainEventLogArchive, {
      order: { createdAt: 'ASC' }
    })

    expect(archives).toHaveLength(2)
    expect(archives[0].range.from.isPastInfinity()).toBe(true)
    expect(archives[0].range.until.toISOString()).toBe('2026-07-01T11:00:00.000Z')

    expect(archivedBuffers).toHaveLength(2)

    const ndjsonLines = Buffer.from(archivedBuffers[0]).toString('utf-8').trim().split('\n')
    expect(ndjsonLines).toHaveLength(2)
    expect(JSON.parse(ndjsonLines[0])).toMatchObject({
      uuid: firstLog.uuid,
      createdAt: '2026-07-01T10:00:00.000Z',
      actorType: DomainEventActorType.API_KEY,
      actorId: firstLog.actorId,
      content: { marker: 'first' }
    })
    expect(JSON.parse(ndjsonLines[1])).toMatchObject({
      uuid: secondLog.uuid,
      createdAt: '2026-07-01T10:30:00.000Z',
      actorType: null,
      actorId: null,
      content: { marker: 'second' }
    })

    const remainingLogs = await setup.entityManager.find(DomainEventLog)
    expect(remainingLogs).toHaveLength(0)

    const files = await setup.entityManager.find(File, {
      where: { uuid: In(archives.map(archive => archive.fileUuid)) },
      order: { createdAt: 'ASC' }
    })
    expect(files).toHaveLength(2)
    expect(files[0].mimeType).toBe(MimeType.NDJSON)
    expect(files[0].key).toMatch(/^test\/[0-9a-f-]+\.ndjson$/)
  })

  it('splits a five hour backlog into five chunks', async (context) => {
    mockNow(context, '2026-07-01T05:00:00.000Z')
    const archivedBuffers: Uint8Array[] = []
    stubCreateUploadWritable(archivedBuffers)

    const logs = [
      '2026-07-01T00:00:00.000Z',
      '2026-07-01T01:00:00.000Z',
      '2026-07-01T02:00:00.000Z',
      '2026-07-01T03:00:00.000Z',
      '2026-07-01T04:00:00.000Z'
    ].map((createdAt, index) =>
      new DomainEventLogBuilder()
        .withCreatedAt(new Date(createdAt))
        .withContent({ marker: `log-${index}` })
        .build()
    )

    await setup.entityManager.insert(DomainEventLog, logs)

    await useCase.execute(ONE_HOUR)

    const archives = await setup.entityManager.find(DomainEventLogArchive, {
      order: { createdAt: 'ASC' }
    })

    expect(archives).toHaveLength(5)
    expect(archivedBuffers).toHaveLength(5)
    expect(await setup.entityManager.count(DomainEventLog)).toBe(0)

    expect(archives[0].range.from.isPastInfinity()).toBe(true)
    expect(archives[0].range.until.toISOString()).toBe('2026-07-01T01:00:00.000Z')
    expect(archives[1].range.from.toISOString()).toBe('2026-07-01T01:00:00.000Z')
    expect(archives[1].range.until.toISOString()).toBe('2026-07-01T02:00:00.000Z')
    expect(archives[4].range.from.toISOString()).toBe('2026-07-01T04:00:00.000Z')
    expect(archives[4].range.until.toISOString()).toBe('2026-07-01T05:00:00.000Z')
  })

  it('resumes from the previous archive range', async (context) => {
    mockNow(context, '2026-07-01T11:15:00.000Z')
    const archivedBuffers: Uint8Array[] = []
    stubCreateUploadWritable(archivedBuffers)

    const archivedFile = new FileBuilder()
      .withName('existing-archive.ndjson')
      .withMimeType(MimeType.NDJSON)
      .build()
    const previousArchive = new DomainEventLogArchiveBuilder()
      .withRange(new DateTimeRange(timestamp.pastInfinity(), timestamp('2026-07-01T09:15:00.000Z')))
      .withFileUuid(archivedFile.uuid)
      .build()

    const firstPendingLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-07-01T09:15:00.000Z'))
      .withContent({ marker: 'pending-1' })
      .build()
    const secondPendingLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-07-01T10:15:00.000Z'))
      .withContent({ marker: 'pending-2' })
      .build()

    await setup.entityManager.insert(File, archivedFile)
    await setup.entityManager.insert(DomainEventLogArchive, previousArchive)
    await setup.entityManager.insert(DomainEventLog, [firstPendingLog, secondPendingLog])

    await useCase.execute(ONE_HOUR)

    const archives = await setup.entityManager.find(DomainEventLogArchive, {
      order: { createdAt: 'ASC' }
    })

    expect(archives).toHaveLength(3)
    expect(archives[1].range.from.toISOString()).toBe('2026-07-01T09:15:00.000Z')
    expect(archives[1].range.until.toISOString()).toBe('2026-07-01T10:15:00.000Z')
    expect(archives[2].range.from.toISOString()).toBe('2026-07-01T10:15:00.000Z')
    expect(archives[2].range.until.toISOString()).toBe('2026-07-01T11:15:00.000Z')
    expect(archivedBuffers).toHaveLength(2)
  })

  it('deletes the uploaded object when finalization fails', async (context) => {
    mockNow(context, '2026-07-01T11:00:00.000Z')
    const archivedBuffers: Uint8Array[] = []
    stubCreateUploadWritable(archivedBuffers)
    fileStorage.delete.resolves()

    const log = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-07-01T10:00:00.000Z'))
      .withContent({ marker: 'cleanup' })
      .build()

    await setup.entityManager.insert(DomainEventLog, log)

    Sinon.stub(repository, 'insertArchive').rejects(new Error('failed to insert archive'))

    await expect(useCase.execute(ONE_HOUR)).rejects.toThrow('failed to insert archive')

    assert.calledOnce(fileStorage.delete)
    expect(archivedBuffers).toHaveLength(1)
    expect(await setup.entityManager.count(DomainEventLogArchive)).toBe(0)
    expect(await setup.entityManager.count(DomainEventLog)).toBe(1)
  })
})
