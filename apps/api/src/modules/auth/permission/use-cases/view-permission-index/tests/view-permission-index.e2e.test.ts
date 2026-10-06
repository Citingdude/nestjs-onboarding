import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

type PermissionGroupResponse = {
  name: string
  permissions: Array<{
    key: Permission
    name: string
    description: string
  }>
}

describe('View permission index e2e test', () => {
  let setup: TestSetup
  let userToken: string

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userToken = (await setup.authContext.getUser([])).token
  })

  after(async () => await setup.teardown())

  it('returns all permissions grouped with translations', async () => {
    const response = await request(setup.httpServer)
      .get('/api/v1/permissions')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Accept-Language', 'en-US')

    expect(response).toHaveStatus(200)

    const { groups } = response.body as { groups: PermissionGroupResponse[] }

    const permissionKeys = Object.values(Permission)
    const expectedGroupCount = new Set(permissionKeys.map((key) => {
      const dotIndex = key.indexOf('.')
      return dotIndex > 0 ? key.substring(0, dotIndex) : key
    })).size

    expect(groups).toHaveLength(expectedGroupCount)

    const returnedPermissions = groups.flatMap(group => group.permissions)
    expect(returnedPermissions).toHaveLength(permissionKeys.length)
    expect(returnedPermissions.map(permission => permission.key))
      .toEqual(expect.arrayContaining(permissionKeys))

    expect(groups).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: 'Admin',
        permissions: expect.arrayContaining([
          expect.objectContaining({
            key: Permission.ALL_PERMISSIONS
          })
        ])
      }),
      expect.objectContaining({
        name: 'Roles',
        permissions: expect.arrayContaining([
          expect.objectContaining({
            key: Permission.ROLE_READ
          })
        ])
      })
    ]))
  })
})
