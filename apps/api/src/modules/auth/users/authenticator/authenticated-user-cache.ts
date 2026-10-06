import { Injectable } from '@nestjs/common'
import { RedisClient, RedisCache } from '@wisemen/nestjs-redis'
import { RedisCachePrefix } from '#src/modules/redis/redis-cache-prefix.js'
import type { AuthenticatedUser as AuthenticatedUser } from '#src/modules/auth/authentication/auth-principal.type.js'

@Injectable()
export class AuthenticatedUserCache extends RedisCache {
  readonly prefix = RedisCachePrefix.USER_AUTH

  constructor (
    private client: RedisClient
  ) {
    super()
  }

  async getAuthorizedUser (userId: string): Promise<AuthenticatedUser | null> {
    const cacheKey = this.buildCacheKey(userId)
    return await this.client.getCachedValue<AuthenticatedUser>(cacheKey)
  }

  async setAuthorizedUser (userId: string, user: AuthenticatedUser): Promise<void> {
    const cacheKey = this.buildCacheKey(userId)
    await this.client.putCachedValue(cacheKey, user)
  }
}
