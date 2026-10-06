import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'

export enum RedisCachePrefix {
  USER_AUTH = 'user-auth',
  USER_ROLE = 'user-role',
  API_KEY_AUTH = 'api-key-auth',
  ROLE = 'role',
  THROTTLER = 'throttler'

}

export function RedisCachePrefixApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: RedisCachePrefix,
    enumName: 'RedisCachePrefix'
  })
}
