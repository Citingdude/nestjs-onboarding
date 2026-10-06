import { Injectable } from '@nestjs/common'
import { RedisClient, RedisCache } from '@wisemen/nestjs-redis'
import { RedisCachePrefix } from '#src/modules/redis/redis-cache-prefix.js'
import type { AuthenticatedApiKey } from '#src/modules/auth/authentication/auth-principal.type.js'
import type { ApiKeySecret } from '#src/modules/auth/api-key/api-key-secret.js'

const API_KEY_AUTH_CACHE_TTL_IN_SECONDS = 300

@Injectable()
export class ApiKeyAuthCache extends RedisCache {
  readonly prefix = RedisCachePrefix.API_KEY_AUTH

  constructor (
    private client: RedisClient
  ) {
    super()
  }

  async get (secret: ApiKeySecret): Promise<AuthenticatedApiKey | null> {
    const cacheKey = this.buildCacheKey(secret.hash)
    return await this.client.getCachedValue<AuthenticatedApiKey>(cacheKey)
  }

  async set (secret: ApiKeySecret, apiKey: AuthenticatedApiKey): Promise<void> {
    const cacheKey = this.buildCacheKey(secret.hash)
    await this.client.putCachedValue(cacheKey, apiKey, API_KEY_AUTH_CACHE_TTL_IN_SECONDS)
  }

  async clear (secretHash: string): Promise<void> {
    const cacheKey = this.buildCacheKey(secretHash)
    await this.client.deleteCachedValue(cacheKey)
  }
}
