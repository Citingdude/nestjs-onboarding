import type { MigrationInterface, QueryRunner } from 'typeorm'
import { Logger } from '@nestjs/common'
import { RedisCachePrefix } from '#src/modules/redis/redis-cache-prefix.js'

export class ClearUserAuthCache1781790958512 implements MigrationInterface {
  name = 'ClearUserAuthCache1781790958512'

  public async up (_queryRunner: QueryRunner): Promise<void> {
    if (process.env.REDIS_URL == null || process.env.REDIS_URL === '') {
      return
    }

    const redis = await import('redis')
    const client = redis.createClient({ url: process.env.REDIS_URL })

    try {
      await client.connect()
      const keys: string[] = []

      for await (const key of client.scanIterator({ MATCH: `${RedisCachePrefix.USER_AUTH}*`, COUNT: 100 })) {
        keys.push(...key)
      }

      if (keys.length > 0) {
        Logger.log(`Deleted ${keys.length} auth keys from Auth Cache`, 'RedisClient')
        await client.del(keys)
      }
    } finally {
      await client.close()
    }
  }

  public async down (_queryRunner: QueryRunner): Promise<void> {
  }
}
