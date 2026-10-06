import { after, afterEach, before, describe, it } from 'node:test'
import { randomUUID } from 'node:crypto'
import assert from 'node:assert'
import request from 'supertest'
import { expect } from 'expect'
import { HttpStatus } from '@nestjs/common'
import { stringify } from 'qs'
import { DateTimeRangeDtoBuilder, timestamp } from '@wisemen/datewise'
import { MultiSelectOperation } from '@wisemen/scoped-filter'
import { generateUuid } from '@wisemen/nestjs-common'
import { DomainEventLogBuilder } from '#src/modules/domain-event-log/domain-event-log.entity.builder.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { ViewDomainEventLogIndexQueryBuilder } from '#src/modules/domain-event-log/use-cases/view-event-log-index/view-domain-event-log-index.query.builder.js'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import { DomainEventActorType, DomainEventActorTypeFilter } from '#src/modules/domain-events/domain-event-actor-type.enum.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { DomainEventLogSource } from '#src/modules/domain-event-log/domain-event-log-source.enum.js'

describe('Get domain event logs end to end tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.EVENT_LOG_READ])
    userWithoutPermission = await setup.authContext.getUser([Permission.USER_READ])
    await setup.entityManager.clear(DomainEventLog)
  })

  after(async () => await setup.teardown())
  afterEach(async () => await setup.entityManager.clear(DomainEventLog))

  it('responds with the event logs', async () => {
    const log = new DomainEventLogBuilder()
      .withActorType(DomainEventActorType.API_KEY)
      .withActorId(generateUuid())
      .build()
    await setup.entityManager.insert(DomainEventLog, log)

    const query = new ViewDomainEventLogIndexQueryBuilder().build()

    const response = await request(setup.httpServer)
      .get('/api/v1/event-logs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(HttpStatus.OK)
    expect(response.body).toStrictEqual({
      items: [expect.objectContaining({
        uuid: log.uuid,
        createdAt: log.createdAt.toISOString(),
        type: log.type,
        content: log.content,
        actorType: log.actorType,
        actorId: log.actorId,
        version: log.version
      })],
      meta: {
        next: {
          createdAt: log.createdAt.toISOString(),
          uuid: log.uuid
        }
      }
    })
  })

  it('filters the results on subject types', async () => {
    const userLog = new DomainEventLogBuilder()
      .withSubjectType(DomainEventSubjectType.USER)
      .build()

    const otherLog = new DomainEventLogBuilder()
      .withSubjectType(null)
      .build()

    await setup.entityManager.insert(DomainEventLog, [userLog, otherLog])

    const query = new ViewDomainEventLogIndexQueryBuilder()
      .withSubjectTypes({
        operation: MultiSelectOperation.INCLUDE,
        values: [DomainEventSubjectType.USER]
      })
      .build()

    const response = await request(setup.httpServer)
      .get('/api/v1/event-logs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(HttpStatus.OK)
    expect(response.body.items).toStrictEqual([expect.objectContaining({ uuid: userLog.uuid })])
  })

  it('filters the results on subject id', async () => {
    const subjectLog = new DomainEventLogBuilder()
      .withSubjectId(randomUUID())
      .build()

    const otherLog = new DomainEventLogBuilder()
      .withSubjectId(null)
      .build()

    await setup.entityManager.insert(DomainEventLog, [subjectLog, otherLog])

    const query = new ViewDomainEventLogIndexQueryBuilder()
      .withSubjectId(subjectLog.subjectId ?? '')
      .build()

    const response = await request(setup.httpServer)
      .get('/api/v1/event-logs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(HttpStatus.OK)
    expect(response.body.items).toStrictEqual([expect.objectContaining({ uuid: subjectLog.uuid })])
  })

  it('filters the results on actor id', async () => {
    const userLog = new DomainEventLogBuilder()
      .withActorType(DomainEventActorType.USER)
      .withActorId(generateUuid())
      .build()

    assert(userLog.actorId != null, 'userLog.actorId is null')

    const otherLog = new DomainEventLogBuilder()
      .withActorType(null)
      .withActorId(null)
      .build()

    await setup.entityManager.insert(DomainEventLog, [userLog, otherLog])

    const query = new ViewDomainEventLogIndexQueryBuilder()
      .withActorIds({
        operation: MultiSelectOperation.INCLUDE,
        values: [userLog.actorId]
      })
      .build()

    const response = await request(setup.httpServer)
      .get('/api/v1/event-logs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(HttpStatus.OK)
    expect(response.body.items).toStrictEqual([expect.objectContaining({ uuid: userLog.uuid })])
  })

  it('filters the results on actor types', async () => {
    const userLog = new DomainEventLogBuilder()
      .withActorType(DomainEventActorType.USER)
      .withActorId(generateUuid())
      .build()
    const apiKeyLog = new DomainEventLogBuilder()
      .withActorType(DomainEventActorType.API_KEY)
      .withActorId(generateUuid())
      .build()
    const systemLog = new DomainEventLogBuilder().build()

    await setup.entityManager.insert(DomainEventLog, [userLog, apiKeyLog, systemLog])

    const query = new ViewDomainEventLogIndexQueryBuilder()
      .withActorTypes(new DomainEventActorTypeFilter(
        MultiSelectOperation.INCLUDE,
        [DomainEventActorType.API_KEY]
      ))
      .build()

    const response = await request(setup.httpServer)
      .get('/api/v1/event-logs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(HttpStatus.OK)
    expect(response.body.items).toStrictEqual([expect.objectContaining({
      uuid: apiKeyLog.uuid,
      actorType: DomainEventActorType.API_KEY,
      actorId: apiKeyLog.actorId
    })])
  })

  it('filters the results on source system and finds only system logs', async () => {
    const systemLog = new DomainEventLogBuilder()
      .withActorType(null)
      .withActorId(null)
      .build()

    const userLog = new DomainEventLogBuilder()
      .withActorType(DomainEventActorType.USER)
      .withActorId(generateUuid())
      .build()

    await setup.entityManager.insert(DomainEventLog, [systemLog, userLog])

    const query = new ViewDomainEventLogIndexQueryBuilder()
      .withSource(DomainEventLogSource.SYSTEM)
      .build()

    const response = await request(setup.httpServer)
      .get('/api/v1/event-logs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(HttpStatus.OK)
    expect(response.body.items).toStrictEqual([expect.objectContaining({
      uuid: systemLog.uuid,
      actorType: null,
      actorId: null
    })])
  })

  it('filters the results on source user and finds only user logs', async () => {
    const userLog = new DomainEventLogBuilder()
      .withActorType(DomainEventActorType.USER)
      .withActorId(generateUuid())
      .build()

    assert(userLog.actorId != null, 'userLog.actorId is null')

    const systemLog = new DomainEventLogBuilder()
      .withActorType(null)
      .withActorId(null)
      .build()

    await setup.entityManager.insert(DomainEventLog, [userLog, systemLog])

    const query = new ViewDomainEventLogIndexQueryBuilder()
      .withSource(DomainEventLogSource.USER)
      .build()

    const response = await request(setup.httpServer)
      .get('/api/v1/event-logs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(HttpStatus.OK)
    expect(response.body.items).toStrictEqual([expect.objectContaining({
      uuid: userLog.uuid,
      actorType: userLog.actorType,
      actorId: userLog.actorId
    })])
  })

  it('filters the results on creation timestamp range', async () => {
    const now = new Date()
    const yesterday = timestamp().subtract(1, 'day')
    const twoDaysAgo = timestamp().subtract(2, 'days')
    const threeDaysAgo = timestamp().subtract(3, 'days')

    const logInRange1 = new DomainEventLogBuilder()
      .withCreatedAt(yesterday.toDate())
      .build()

    const logInRange2 = new DomainEventLogBuilder()
      .withCreatedAt(twoDaysAgo.toDate())
      .build()

    const logOutsideRange = new DomainEventLogBuilder()
      .withCreatedAt(threeDaysAgo.toDate())
      .build()

    const futureLog = new DomainEventLogBuilder()
      .withCreatedAt(timestamp().add(1, 'minute').toDate())
      .build()

    await setup.entityManager.insert(DomainEventLog, [
      logInRange1,
      logInRange2,
      logOutsideRange,
      futureLog
    ])

    const query = new ViewDomainEventLogIndexQueryBuilder()
      .withInRange(
        new DateTimeRangeDtoBuilder()
          .withFrom(twoDaysAgo.toISOString())
          .withUntil(now.toISOString())
          .build()
      )
      .build()

    const response = await request(setup.httpServer)
      .get('/api/v1/event-logs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify(query))

    expect(response).toHaveStatus(HttpStatus.OK)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.items).toStrictEqual([
      expect.objectContaining({ uuid: logInRange1.uuid }),
      expect.objectContaining({ uuid: logInRange2.uuid })
    ])
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get('/api/v1/event-logs')
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
