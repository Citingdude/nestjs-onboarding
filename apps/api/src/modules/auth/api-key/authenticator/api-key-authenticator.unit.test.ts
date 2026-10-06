import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { timestamp } from '@wisemen/datewise'
import { generateUuid } from '@wisemen/nestjs-common'
import { ApiKeyAuthenticator } from './api-key-authenticator.js'
import { InvalidOrExpiredApiKeyError } from '#src/modules/auth/api-key/authenticator/invalid-or-expired-api-key.error.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { ApiKeySecret } from '#src/modules/auth/api-key/api-key-secret.js'
import { ApiKeyAuthCache } from '#src/modules/auth/api-key/authenticator/cache/api-key-auth-cache.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { User } from '#src/modules/auth/users/entities/user.entity.js'

function buildApiKey (): ApiKey {
  const apiKey = new ApiKey()
  apiKey.uuid = generateUuid<ApiKeyUuid>()
  apiKey.createdAt = timestamp().toDate()
  apiKey.deletedAt = null
  apiKey.expiresAt = timestamp().add(1, 'month').toDate()
  apiKey.name = 'cached-key'
  apiKey.permissions = [Permission.CONTACT_READ]
  apiKey.secretHash = 'secret-hash'
  apiKey.secretLastChars = 'abcde'
  apiKey.userUuid = generateUuid<UserUuid>()
  apiKey.user = { userId: 'user-id' } as User

  return apiKey
}

describe('ApiKeyAuthenticator unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('returns the cached api key when present', async () => {
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    const apiKeyAuthCache = createStubInstance(ApiKeyAuthCache)
    const cachedApiKey = {
      type: 'api-key' as const,
      apiKeyUuid: generateUuid<ApiKeyUuid>(),
      permissions: [Permission.CONTACT_READ],
      userUuid: generateUuid<UserUuid>(),
      userId: 'user-id'
    }

    apiKeyAuthCache.get.resolves(cachedApiKey)

    const service = new ApiKeyAuthenticator(
      apiKeyRepository,
      apiKeyAuthCache
    )

    const cachedSecret = new ApiKeySecret()
    const result = await service.authenticate(cachedSecret.value)

    expect(result).toEqual(cachedApiKey)
    expect(apiKeyRepository.findOne.called).toBe(false)
    expect(apiKeyAuthCache.set.called).toBe(false)
  })

  it('fetches the api key and stores it in cache on a cache miss', async () => {
    const apiKey = buildApiKey()
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    const apiKeyAuthCache = createStubInstance(ApiKeyAuthCache)
    apiKeyAuthCache.get.resolves(null)
    apiKeyRepository.findOne.resolves(apiKey)

    const service = new ApiKeyAuthenticator(
      apiKeyRepository,
      apiKeyAuthCache
    )

    const liveSecret = new ApiKeySecret()
    const result = await service.authenticate(liveSecret.value)

    expect(result).toEqual({
      type: 'api-key',
      apiKeyUuid: apiKey.uuid,
      permissions: apiKey.permissions,
      userUuid: apiKey.userUuid,
      userId: apiKey.user!.userId
    })
    expect(apiKeyRepository.findOne.calledOnce).toBe(true)
    expect(apiKeyAuthCache.set.calledOnce).toBe(true)

    const [cachedSecret, cachedApiKey] = apiKeyAuthCache.set.firstCall.args
    expect(cachedSecret.value).toBe(liveSecret.value)
    expect(cachedApiKey).toEqual(result)
  })

  it('throws an error when the api key cannot be found', async () => {
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    const apiKeyAuthCache = createStubInstance(ApiKeyAuthCache)
    apiKeyAuthCache.get.resolves(null)
    apiKeyRepository.findOne.resolves(null)

    const service = new ApiKeyAuthenticator(apiKeyRepository, apiKeyAuthCache)

    await expect(service.authenticate('ak_missing'))
      .rejects.toThrow(new InvalidOrExpiredApiKeyError())
    expect(apiKeyRepository.findOne.calledOnce).toBe(true)
  })

  it('throws an error when the api key has been deleted', async () => {
    const apiKey = buildApiKey()
    apiKey.deletedAt = new Date('2026-05-27T11:00:00.000Z')

    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    const apiKeyAuthCache = createStubInstance(ApiKeyAuthCache)
    apiKeyAuthCache.get.resolves(null)
    apiKeyRepository.findOne.resolves(apiKey)

    const service = new ApiKeyAuthenticator(
      apiKeyRepository,
      apiKeyAuthCache
    )

    await expect(service.authenticate('ak_deleted'))
      .rejects.toThrow(new InvalidOrExpiredApiKeyError())
  })

  it('throws an error when the api key has expired', async () => {
    const apiKey = buildApiKey()
    apiKey.expiresAt = new Date('2020-01-01T00:00:00.000Z')

    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    const apiKeyAuthCache = createStubInstance(ApiKeyAuthCache)
    apiKeyAuthCache.get.resolves(null)
    apiKeyRepository.findOne.resolves(apiKey)

    const service = new ApiKeyAuthenticator(
      apiKeyRepository,
      apiKeyAuthCache
    )

    await expect(service.authenticate('ak_expired'))
      .rejects.toThrow(new InvalidOrExpiredApiKeyError())
  })
})
