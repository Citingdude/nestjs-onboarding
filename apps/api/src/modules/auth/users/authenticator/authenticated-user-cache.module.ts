import { Module } from '@nestjs/common'
import { AuthenticatedUserCache } from './authenticated-user-cache.js'
import { DefaultRedisModule } from '#src/modules/redis/default-redis.module.js'

@Module({
  imports: [
    DefaultRedisModule
  ],
  providers: [AuthenticatedUserCache],
  exports: [AuthenticatedUserCache]
})
export class AuthenticatedUserCacheModule {}
