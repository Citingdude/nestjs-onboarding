import { Module } from '@nestjs/common'
import { RedisClient } from '@wisemen/nestjs-redis'
import { ApiThrottlerModule, RedisThrottlerStorage } from '@wisemen/nestjs-throttler'
import { ConfigService } from '@nestjs/config'
import { DefaultRedisModule } from '#src/modules/redis/default-redis.module.js'

const isRedisConfigured = process.env.REDIS_URL != null && process.env.REDIS_URL !== ''

@Module({
  imports: [
    ApiThrottlerModule.forRootAsync({
      imports: [DefaultRedisModule],
      inject: [ConfigService, RedisClient],
      useFactory: (cfg: ConfigService, redisClient: RedisClient) => {
        return {
          storage: isRedisConfigured ? new RedisThrottlerStorage(redisClient) : undefined,
          throttler: {
            ttl: cfg.get<number>('THROTTLE_TTL'),
            limit: cfg.get<number>('THROTTLE_LIMIT')
          }
        }
      }
    })
  ],
  exports: [ApiThrottlerModule]
})
export class DefaultApiThrottlerModule {}
