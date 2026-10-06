import { after, afterEach, before, describe, it } from 'node:test'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { expect } from 'expect'
import { stringify } from 'qs'
import request from 'supertest'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { SyncTypesenseJob } from '#src/modules/typesense/use-cases/sync-collection/sync-typesense-collection.job.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

type ViewJobsIndexQueryKey = {
  createdAt: string
  id: string
}

describe('View job index end to end tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser
  let jobScheduler: PgBossScheduler

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.JOBS_READ_INDEX])
    userWithoutPermission = await setup.authContext.getUser([Permission.JOBS_READ_DETAIL])
    jobScheduler = setup.testModule.get(PgBossScheduler, { strict: false })
  })

  after(async () => await setup.teardown())
  afterEach(async () => {
    await setup.entityManager.deleteAll('pgboss.job')
  })

  it('responds with jobs', async () => {
    await jobScheduler.scheduleJob(new SyncTypesenseJob(TypesenseCollectionName.USER))

    const response = await request(setup.httpServer)
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body).toStrictEqual(expect.objectContaining({
      items: expect.arrayContaining([
        expect.objectContaining({
          queueName: expect.isEnumValue(QueueName),
          id: expect.any(String),
          name: SyncTypesenseJob.name,
          createdAt: expect.ISO8601(),
          completedAt: null
        })
      ])
    }))
  })

  it('responds with the next jobs when giving the next key', async () => {
    await jobScheduler.scheduleJobs([
      new SyncTypesenseJob(TypesenseCollectionName.USER),
      new SyncTypesenseJob(TypesenseCollectionName.USER)
    ])

    const response = await request(setup.httpServer)
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(stringify({ pagination: { limit: 1 } }))

    expect(response).toHaveStatus(200)
    expect(response.body).toStrictEqual(expect.objectContaining({
      meta: {
        next: expect.anything()
      }
    }))

    const key = response.body.meta.next as ViewJobsIndexQueryKey
    const nextResponse = await request(setup.httpServer)
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(stringify({ pagination: { key, limit: 1 } }))

    expect(nextResponse).toHaveStatus(200)
    expect(nextResponse.body).toStrictEqual(expect.objectContaining({
      items: [expect.objectContaining({
        queueName: expect.isEnumValue(QueueName),
        id: expect.any(String),
        name: SyncTypesenseJob.name,
        createdAt: expect.ISO8601(),
        completedAt: null
      })]
    }))
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
