import { Module, type ModuleMetadata } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { captureException } from '@wisemen/opentelemetry'
import { RedisClient, RedisModule } from '@wisemen/nestjs-redis'
import { NoopRedisClient } from '#src/modules/redis/noop-redis-client.js'

const isRedisConfigured = process.env.REDIS_URL != null && process.env.REDIS_URL !== ''

function createRedisModuleMetadata (): ModuleMetadata {
  if (!isRedisConfigured) {
    return {
      providers: [{ provide: RedisClient, useClass: NoopRedisClient }],
      exports: [RedisClient]
    }
  }

  return {
    imports: [RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.getOrThrow('REDIS_URL'),
        pingInterval: config.get('REDIS_PING_INTERVAL'),
        ttl: config.get('REDIS_DEFAULT_TTL'),
        onClientError: (error) => {
          captureException(error)
        }
      })
    })],
    exports: [RedisModule]
  }
}

@Module(createRedisModuleMetadata())
export class DefaultRedisModule {}
