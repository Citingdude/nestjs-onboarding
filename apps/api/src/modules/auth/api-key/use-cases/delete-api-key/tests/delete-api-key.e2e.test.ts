import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { generateUuid } from '@wisemen/nestjs-common'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

function buildApiKey (userUuid: UserUuid): ApiKey {
  const apiKey = new ApiKey()
  apiKey.uuid = generateUuid<ApiKeyUuid>()
  apiKey.createdAt = new Date('2026-05-27T10:00:00.000Z')
  apiKey.deletedAt = null
  apiKey.expiresAt = null
  apiKey.name = 'Delete me'
  apiKey.permissions = [Permission.CONTACT_READ]
  apiKey.secretHash = `secret-hash-${apiKey.uuid}`
  apiKey.secretLastChars = 'abcde'
  apiKey.userUuid = userUuid

  return apiKey
}

describe('Delete api key e2e tests', () => {
  let setup: TestSetup
  let adminUser: TestUser
  let ownDeleteUser: TestUser
  let anotherOwnDeleteUser: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    adminUser = await setup.authContext.getUser([Permission.API_KEY_DELETE])
    ownDeleteUser = await setup.authContext.getUser([Permission.API_KEY_DELETE_OWN])
    anotherOwnDeleteUser = await setup.authContext.getUser([Permission.API_KEY_DELETE_OWN])
    userWithoutPermission = await setup.authContext.getUser([Permission.CONTACT_READ])
  })

  after(async () => await setup.teardown())

  it('soft deletes an owned api key successfully', async () => {
    const apiKey = buildApiKey(ownDeleteUser.user.uuid)
    await setup.entityManager.save(ApiKey, apiKey)

    const response = await request(setup.httpServer)
      .delete(`/api/v1/api-keys/${apiKey.uuid}`)
      .set('Authorization', `Bearer ${ownDeleteUser.token}`)

    expect(response).toHaveStatus(204)

    const deletedApiKey = await setup.entityManager.findOneOrFail(ApiKey, {
      where: { uuid: apiKey.uuid },
      withDeleted: true
    })

    expect(deletedApiKey.deletedAt).not.toBeNull()
  })

  it('returns 404 when the api key does not exist', async () => {
    const response = await request(setup.httpServer)
      .delete(`/api/v1/api-keys/${generateUuid<ApiKeyUuid>()}`)
      .set('Authorization', `Bearer ${adminUser.token}`)

    expect(response).toHaveStatus(404)
    expect(response).toHaveErrorCode('api_key_not_found')
  })

  it('returns 404 when the api key has already been deleted', async () => {
    const apiKey = buildApiKey(adminUser.user.uuid)
    apiKey.deletedAt = new Date('2026-05-27T12:00:00.000Z')
    await setup.entityManager.save(ApiKey, apiKey)

    const response = await request(setup.httpServer)
      .delete(`/api/v1/api-keys/${apiKey.uuid}`)
      .set('Authorization', `Bearer ${adminUser.token}`)

    expect(response).toHaveStatus(404)
    expect(response).toHaveErrorCode('api_key_not_found')
  })

  it('returns 404 when an own-delete user targets another user their api key', async () => {
    const apiKey = buildApiKey(anotherOwnDeleteUser.user.uuid)
    await setup.entityManager.save(ApiKey, apiKey)

    const response = await request(setup.httpServer)
      .delete(`/api/v1/api-keys/${apiKey.uuid}`)
      .set('Authorization', `Bearer ${ownDeleteUser.token}`)

    expect(response).toHaveStatus(404)
    expect(response).toHaveErrorCode('api_key_not_found')
  })

  it('allows an admin user to delete another user their api key', async () => {
    const apiKey = buildApiKey(ownDeleteUser.user.uuid)
    await setup.entityManager.save(ApiKey, apiKey)

    const response = await request(setup.httpServer)
      .delete(`/api/v1/api-keys/${apiKey.uuid}`)
      .set('Authorization', `Bearer ${adminUser.token}`)

    expect(response).toHaveStatus(204)
  })

  it('returns 403 when user does not have permission', async () => {
    const apiKey = buildApiKey(adminUser.user.uuid)
    await setup.entityManager.save(ApiKey, apiKey)

    const response = await request(setup.httpServer)
      .delete(`/api/v1/api-keys/${apiKey.uuid}`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
