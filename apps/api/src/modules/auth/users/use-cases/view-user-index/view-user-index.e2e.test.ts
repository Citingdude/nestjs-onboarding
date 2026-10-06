import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { TypesenseClient } from '@wisemen/nestjs-typesense'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('View user index e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser
  let defaultUser: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()

    defaultUser = await setup.authContext.getDefaultUser()
    userWithPermission = await setup.authContext.getUser([Permission.USER_READ])
    userWithoutPermission = await setup.authContext.getUser([Permission.USER_CREATE])

    const client = setup.testModule.get(TypesenseClient)
    await client.truncateCollection(TypesenseCollectionName.USER)
    await client.importManually(
      TypesenseCollectionName.USER,
      [userWithPermission.user, defaultUser.user]
    )
  })

  after(async () => await setup.teardown())

  it('returns users in a paginated format', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/users`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query({
        pagination: {
          limit: 10,
          offset: 0
        }
      })

    expect(response).toHaveStatus(200)
    expect(response.body.items).toHaveLength(2)
  })

  it('includes user roles', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/users`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query({
        pagination: {
          limit: 10,
          offset: 0
        }
      })

    expect(response).toHaveStatus(200)
    expect(response.body.items).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        roles: expect.arrayContaining([{
          uuid: defaultUser.user.userRoles![0].role!.uuid,
          name: defaultUser.user.userRoles![0].role!.name
        }])
      })
    ]))
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get(`/api/v1/users`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
