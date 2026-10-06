import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { timestamp } from '@wisemen/datewise'
import { CreateApiKeyCommandBuilder } from '#src/modules/auth/api-key/use-cases/create-api-key/create-api-key.command.builder.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { CreateApiKeyResponse } from '#src/modules/auth/api-key/use-cases/create-api-key/create-api-key.response.js'
import { ApiKeySecret } from '#src/modules/auth/api-key/api-key-secret.js'

describe('Create api key e2e tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([
      Permission.API_KEY_CREATE,
      Permission.CONTACT_READ
    ])
    userWithoutPermission = await setup.authContext.getUser([Permission.CONTACT_READ])
  })

  after(async () => await setup.teardown())

  it('creates an api key successfully', async () => {
    const expiresAt = timestamp().add(1, 'month').toISOString()
    const command = new CreateApiKeyCommandBuilder()
      .withName('  Primary integration key  ')
      .withPermissions([Permission.CONTACT_READ])
      .withExpiresAt(expiresAt)
      .build()

    const response = await request(setup.httpServer)
      .post('/api/v1/api-keys')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)
    const body = response.body as CreateApiKeyResponse

    expect(response).toHaveStatus(201)
    expect(response.body).toEqual(expect.objectContaining({
      uuid: expect.uuid(),
      name: 'Primary integration key',
      permissions: [Permission.CONTACT_READ],
      userUuid: userWithPermission.user.uuid,
      userEmail: userWithPermission.user.email,
      expiresAt: expiresAt,
      createdAt: expect.ISO8601(),
      apiKey: expect.any(String)
    }))
    expect(body.apiKey.startsWith('ak_')).toBe(true)

    const createdApiKey = await setup.entityManager.findOneByOrFail(ApiKey, { uuid: body.uuid })
    const secret = new ApiKeySecret(body.apiKey)

    expect(createdApiKey.name).toBe('Primary integration key')
    expect(createdApiKey.permissions).toEqual([Permission.CONTACT_READ])
    expect(createdApiKey.userUuid).toBe(userWithPermission.user.uuid)
    expect(createdApiKey.deletedAt).toBeNull()
    expect(createdApiKey.expiresAt?.toISOString()).toBe(expiresAt)
    expect(createdApiKey.secretHash).toBe(secret.hash)
    expect(body.maskedKey).toBe(secret.maskedValue)
  })

  it('returns 403 when user does not have permission', async () => {
    const command = new CreateApiKeyCommandBuilder().build()

    const response = await request(setup.httpServer)
      .post('/api/v1/api-keys')
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })

  it('returns 400 when expiresAt is in the past', async () => {
    const command = new CreateApiKeyCommandBuilder()
      .withExpiresAt('2020-01-01T00:00:00.000Z')
      .build()

    const response = await request(setup.httpServer)
      .post('/api/v1/api-keys')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(400)
    expect(response).toHaveErrorCode('api_key_invalid_expires_at')
  })

  it('returns 400 when a disallowed api key permission is requested', async () => {
    const command = new CreateApiKeyCommandBuilder()
      .withPermissions([Permission.API_KEY_READ])
      .build()

    const response = await request(setup.httpServer)
      .post('/api/v1/api-keys')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(400)
    expect(response).toHaveErrorCode('api_key_invalid_permissions')
  })

  it('returns 400 when the creator does not own all requested permissions', async () => {
    const command = new CreateApiKeyCommandBuilder()
      .withPermissions([Permission.USER_READ])
      .build()

    const response = await request(setup.httpServer)
      .post('/api/v1/api-keys')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(400)
    expect(response).toHaveErrorCode('api_key_invalid_permissions')
  })
})
