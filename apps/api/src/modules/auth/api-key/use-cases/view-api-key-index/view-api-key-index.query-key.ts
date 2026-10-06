import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsUUID } from 'class-validator'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'

export class ViewApiKeyIndexQueryKey {
  @ApiProperty({ format: 'date-time' })
  @IsISO8601({ strict: true })
  createdAt: string

  @ApiProperty({ type: 'string', format: 'uuid' })
  @IsUUID()
  uuid: ApiKeyUuid

  static nextKey (apiKeys: ApiKey[]): ViewApiKeyIndexQueryKey | null {
    if (apiKeys.length === 0) {
      return null
    }

    const lastItem = apiKeys.at(-1) as ApiKey

    return this.from(lastItem)
  }

  static from (apiKey: ApiKey): ViewApiKeyIndexQueryKey {
    const key = new ViewApiKeyIndexQueryKey()

    key.createdAt = apiKey.createdAt.toISOString()
    key.uuid = apiKey.uuid

    return key
  }
}
