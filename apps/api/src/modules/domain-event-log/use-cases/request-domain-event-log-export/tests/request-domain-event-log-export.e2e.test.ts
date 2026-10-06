import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { MultiSelectOperation } from '@wisemen/scoped-filter'
import { Export } from '#src/app/export/entities/export.entity.js'
import { ExportType } from '#src/app/export/entities/export-type.enum.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { DomainEventSubjectType, DomainEventSubjectTypeFilter } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { RequestDomainEventLogExportCommandBuilder } from '#src/modules/domain-event-log/use-cases/request-domain-event-log-export/request-domain-event-log-export.command.builder.js'
import type { RequestDomainEventLogExportResponse } from '#src/modules/domain-event-log/use-cases/request-domain-event-log-export/request-domain-event-log-export.response.js'

describe('Request domain event log export', () => {
  let setup: TestSetup
  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([Permission.EVENT_LOG_EXPORT])
  })

  after(async () => await setup.teardown())

  it('successfully schedules a domain event log CSV export job', async () => {
    const command = new RequestDomainEventLogExportCommandBuilder()
      .withSubjectTypes(new DomainEventSubjectTypeFilter(
        MultiSelectOperation.INCLUDE,
        [DomainEventSubjectType.USER]
      ))
      .build()

    const response = await request(setup.httpServer)
      .post('/api/v1/event-logs/export')
      .set('Authorization', `Bearer ${user.token}`)
      .send(command)

    expect(response).toHaveStatus(201)
    expect(response.body).toStrictEqual({ exportUuid: expect.uuid() })

    const exportRecord = await setup.entityManager.findOneByOrFail(Export, {
      uuid: (response.body as RequestDomainEventLogExportResponse).exportUuid
    })

    expect(exportRecord.requestedByUserUuid).toBe(user.user.uuid)
    expect(exportRecord.type).toBe(ExportType.DOMAIN_EVENT_LOG_CSV)
  })

  it('returns 403 when user does not have permission', async () => {
    const unauthorizedUser = await setup.authContext.getUser([])

    const response = await request(setup.httpServer)
      .post('/api/v1/event-logs/export')
      .set('Authorization', `Bearer ${unauthorizedUser.token}`)
      .send({})

    expect(response).toHaveStatus(403)
  })
})
