import type { RedisCachePrefix } from '#src/modules/redis/redis-cache-prefix.js'

export abstract class RedisCache {
  abstract readonly prefix: RedisCachePrefix

  protected buildCacheKey (id: string): string {
    return `${this.prefix}.${id}`
  }
}
