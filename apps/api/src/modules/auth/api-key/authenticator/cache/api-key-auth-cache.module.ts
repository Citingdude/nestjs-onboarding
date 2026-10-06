import { Module } from '@nestjs/common'
import { ApiKeyAuthCache } from './api-key-auth-cache.js'
import { DefaultRedisModule } from '#src/modules/redis/default-redis.module.js'

@Module({
  imports: [
    DefaultRedisModule
  ],
  providers: [ApiKeyAuthCache],
  exports: [ApiKeyAuthCache]
})
export class ApiKeyAuthCacheModule {}
