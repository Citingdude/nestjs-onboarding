import { after, before, describe, it } from 'node:test'
import { expect } from 'expect'
import { MultiSelectOperation } from '@wisemen/scoped-filter'
import { generateUuid } from '@wisemen/nestjs-common'
import { Export } from '#src/app/export/entities/export.entity.js'
import { ExportBuilder } from '#src/app/export/entities/export.entity.builder.js'
import { ExportStatus } from '#src/app/export/entities/export-status.enum.js'
import { ExportType } from '#src/app/export/entities/export-type.enum.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import { UserPreferencesBuilder } from '#src/app/user-preferences/entities/user-preferences.entity.builder.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { DomainEventLogBuilder } from '#src/modules/domain-event-log/domain-event-log.entity.builder.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { ExportDomainEventLogJobRepository } from '#src/modules/domain-event-log/use-cases/export-domain-event-log/export-domain-event-log-job.repository.js'
import { ExportDomainEventLogJobHandler } from '#src/modules/domain-event-log/use-cases/export-domain-event-log/export-domain-event-log.job-handler.js'
import { DomainEventActorIdFilter } from '#src/modules/domain-events/domain-event-actor-id.filter.js'
import { ExportDomainEventLogJob, type ExportDomainEventLogJobData } from '#src/modules/domain-event-log/use-cases/export-domain-event-log/export-domain-event-log.job.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { DomainEventSubjectType, DomainEventSubjectTypeFilter } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import { DomainEventActorType, DomainEventActorTypeFilter } from '#src/modules/domain-events/domain-event-actor-type.enum.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import { SystemQueueModule } from '#src/modules/queue-modules/system-queue.module.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

describe('Export domain event log job integration test', () => {
  let setup: TestSetup
  let handler: ExportDomainEventLogJobHandler
  let repository: ExportDomainEventLogJobRepository
  let user: User

  before(async () => {
    setup = await TestBench.setupModuleTest(SystemQueueModule)

    handler = setup.app.get(ExportDomainEventLogJobHandler, { strict: false })
    repository = setup.app.get(ExportDomainEventLogJobRepository, { strict: false })

    user = new UserBuilder().build()
    await setup.entityManager.insert(User, user)
    await setup.entityManager.insert(UserPreferences, new UserPreferencesBuilder()
      .withUserUuid(user.uuid)
      .withLanguage(Locale.EN_US)
      .build()
    )
  })

  after(async () => {
    await setup.teardown()
  })

  async function createExport (): Promise<Export> {
    const entity = new ExportBuilder()
      .withStatus(ExportStatus.CREATED)
      .withType(ExportType.DOMAIN_EVENT_LOG_CSV)
      .withRequestedByUserUuid(user.uuid)
      .build()

    await setup.entityManager.insert(Export, entity)
    return entity
  }

  it('generates a CSV with the filtered domain event logs', async () => {
    const includedLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-05-27T12:00:00.000Z'))
      .withVersion(3)
      .withSource('system')
      .withType(DomainEventType.CONTACT_CREATED)
      .withSubjectType(DomainEventSubjectType.USER)
      .withSubjectId(generateUuid())
      .withActorType(DomainEventActorType.USER)
      .withActorId(user.uuid)
      .withContent({ marker: 'included-event-log', value: 'with "quotes"' })
      .withTraceId('trace-1')
      .build()
    const excludedLog = new DomainEventLogBuilder()
      .withCreatedAt(new Date('2026-05-27T11:00:00.000Z'))
      .withSubjectType(DomainEventSubjectType.CONTACT)
      .withContent({ marker: 'excluded-event-log' })
      .build()

    await setup.entityManager.insert(DomainEventLog, [includedLog, excludedLog])

    const exportRecord = await createExport()

    const job = new ExportDomainEventLogJob({
      requestedByUserUuid: user.uuid,
      exportUuid: exportRecord.uuid,
      subjectTypes: new DomainEventSubjectTypeFilter(
        MultiSelectOperation.INCLUDE,
        [DomainEventSubjectType.USER]
      )
    })

    await handler.run(job.data)

    const updatedExport = await setup.entityManager.findOneByOrFail(Export, {
      uuid: exportRecord.uuid
    })

    expect(updatedExport.errorMessage).toBeNull()
    expect(updatedExport.status).toBe(ExportStatus.SUCCEEDED)
    expect(updatedExport.fileUuid).not.toBeNull()
  })

  it('streams only the logs matching the actor type and actor id filters', async () => {
    const userActorId = generateUuid()
    const apiKeyActorId = generateUuid()
    const userLog = new DomainEventLogBuilder()
      .withActorType(DomainEventActorType.USER)
      .withActorId(userActorId)
      .build()
    const apiKeyLog = new DomainEventLogBuilder()
      .withActorType(DomainEventActorType.API_KEY)
      .withActorId(apiKeyActorId)
      .build()
    const systemLog = new DomainEventLogBuilder().build()

    await setup.entityManager.insert(DomainEventLog, [userLog, apiKeyLog, systemLog])

    async function streamUuids (
      filters: Partial<ExportDomainEventLogJobData>
    ): Promise<string[]> {
      const stream = await repository.streamDomainEventLogs({
        requestedByUserUuid: user.uuid,
        exportUuid: generateUuid(),
        ...filters
      })
      const uuids: string[] = []

      for await (const row of stream) {
        uuids.push((row as DomainEventLog).uuid)
      }

      return uuids
    }

    const byType = await streamUuids({
      actorTypes: new DomainEventActorTypeFilter(
        MultiSelectOperation.INCLUDE,
        [DomainEventActorType.API_KEY]
      )
    })
    const byId = await streamUuids({
      actorIds: new DomainEventActorIdFilter(MultiSelectOperation.INCLUDE, [userActorId])
    })

    expect(byType).toEqual([apiKeyLog.uuid])
    expect(byId).toEqual([userLog.uuid])
  })
})
