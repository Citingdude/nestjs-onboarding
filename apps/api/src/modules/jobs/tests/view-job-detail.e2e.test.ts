import { after, afterEach, before, describe, it } from 'node:test'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { expect } from 'expect'
import request from 'supertest'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { SyncTypesenseJob } from '#src/modules/typesense/use-cases/sync-collection/sync-typesense-collection.job.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

describe('View job detail end to end tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser
  let jobScheduler: PgBossScheduler

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.JOBS_READ_DETAIL])
    userWithoutPermission = await setup.authContext.getUser([Permission.JOBS_READ_INDEX])
    jobScheduler = setup.testModule.get(PgBossScheduler, { strict: false })
  })

  after(async () => await setup.teardown())
  afterEach(async () => {
    await setup.entityManager.deleteAll('pgboss.job')
  })

  it('responds with the details of a job', async () => {
    await jobScheduler.scheduleJob(new SyncTypesenseJob(TypesenseCollectionName.USER))
    const { id } = await setup.entityManager.createQueryBuilder()
      .select('id')
      .from('pgboss.job', 'job')
      .getRawOne<{ id: string }>() ?? { id: '' }

    const response = await request(setup.httpServer)
      .get(`/api/v1/jobs/${id}`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(200)
  })

  it('returns 403 when user does not have permission', async () => {
    await jobScheduler.scheduleJob(new SyncTypesenseJob(TypesenseCollectionName.USER))
    const { id } = await setup.entityManager.createQueryBuilder()
      .select('id')
      .from('pgboss.job', 'job')
      .getRawOne<{ id: string }>() ?? { id: '' }

    const response = await request(setup.httpServer)
      .get(`/api/v1/jobs/${id}`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
