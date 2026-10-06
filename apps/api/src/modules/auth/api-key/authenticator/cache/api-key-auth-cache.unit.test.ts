import { describe, it } from 'node:test'
import { expect } from 'expect'
import { createStubInstance } from 'sinon'
import { RedisClient } from '@wisemen/nestjs-redis'
import { generateUuid } from '@wisemen/nestjs-common'
import { ApiKeyAuthCache } from './api-key-auth-cache.js'
import type { AuthenticatedApiKey } from '#src/modules/auth/authentication/auth-principal.type.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { ApiKeySecret } from '#src/modules/auth/api-key/api-key-secret.js'

describe('ApiKeyAuthCache unit tests', () => {
  it('returns the cached authorized api key', async () => {
    const redisClient = createStubInstance(RedisClient)
    const cache = new ApiKeyAuthCache(redisClient)

    const authorizedApiKey: AuthenticatedApiKey = {
      type: 'api-key' as const,
      apiKeyUuid: generateUuid<ApiKeyUuid>(),
      permissions: [Permission.CONTACT_READ],
      userUuid: generateUuid<UserUuid>(),
      userId: generateUuid()
    }

    redisClient.getCachedValue.resolves(authorizedApiKey)

    const result = await cache.get(new ApiKeySecret())

    expect(result).toEqual(authorizedApiKey)
  })

  it('stores the authorized api key under its secret hash with a 5 minute ttl', async () => {
    const redisClient = createStubInstance(RedisClient)
    const cache = new ApiKeyAuthCache(redisClient)

    const authorizedApiKey: AuthenticatedApiKey = {
      type: 'api-key' as const,
      apiKeyUuid: generateUuid<ApiKeyUuid>(),
      permissions: [Permission.CONTACT_READ],
      userUuid: generateUuid<UserUuid>(),
      userId: generateUuid()
    }

    redisClient.putCachedValue.resolves()

    const secret = new ApiKeySecret()
    await cache.set(secret, authorizedApiKey)

    expect(redisClient.putCachedValue.calledOnceWithExactly(
      'api-key-auth.' + secret.hash,
      authorizedApiKey,
      300
    )).toBe(true)
  })

  it('deletes the cached authorized api key for its secret hash', async () => {
    const redisClient = createStubInstance(RedisClient)
    const cache = new ApiKeyAuthCache(redisClient)

    redisClient.deleteCachedValue.resolves()

    await cache.clear('secret-hash')

    expect(redisClient.deleteCachedValue.calledOnceWithExactly('api-key-auth.secret-hash')).toBe(true)
  })
})
