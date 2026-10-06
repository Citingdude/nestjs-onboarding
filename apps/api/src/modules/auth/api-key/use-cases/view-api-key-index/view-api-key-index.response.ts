import assert from 'assert'
import { ApiProperty } from '@nestjs/swagger'
import type { PaginatedKeysetResponse, PaginatedKeysetResponseMeta } from '@wisemen/pagination'
import { ViewApiKeyIndexQueryKey } from './view-api-key-index.query-key.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { PermissionApiProperty } from '#src/modules/auth/permission/permission.api-property.js'
import { ApiKeySecret } from '#src/modules/auth/api-key/api-key-secret.js'

class ViewApiKeyIndexItemResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: ApiKeyUuid

  @ApiProperty({ type: String, example: 'Primary integration key' })
  name: string

  @PermissionApiProperty({ isArray: true })
  permissions: Permission[]

  @ApiProperty({ type: String })
  userUuid: string

  @ApiProperty({ type: String })
  userEmail: string

  @ApiProperty({ type: String, example: '**********************************************abcde' })
  maskedKey: string

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  expiresAt: string | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string

  constructor (apiKey: ApiKey) {
    assert(apiKey.user !== undefined, 'user relation not loaded')

    this.uuid = apiKey.uuid
    this.name = apiKey.name
    this.permissions = apiKey.permissions
    this.userUuid = apiKey.userUuid
    this.userEmail = apiKey.user.email
    this.maskedKey = ApiKeySecret.mask(apiKey.secretLastChars)
    this.expiresAt = apiKey.expiresAt?.toISOString() ?? null
    this.createdAt = apiKey.createdAt.toISOString()
  }
}

class ViewApiKeyIndexResponseMeta implements PaginatedKeysetResponseMeta {
  @ApiProperty({ type: ViewApiKeyIndexQueryKey, nullable: true })
  next: ViewApiKeyIndexQueryKey | null

  constructor (apiKeys: ApiKey[]) {
    this.next = ViewApiKeyIndexQueryKey.nextKey(apiKeys)
  }
}

export class ViewApiKeyIndexResponse implements PaginatedKeysetResponse {
  @ApiProperty({ type: ViewApiKeyIndexItemResponse, isArray: true })
  items: ViewApiKeyIndexItemResponse[]

  @ApiProperty({ type: ViewApiKeyIndexResponseMeta })
  meta: ViewApiKeyIndexResponseMeta

  constructor (apiKeys: ApiKey[]) {
    this.items = apiKeys.map(apiKey => new ViewApiKeyIndexItemResponse(apiKey))
    this.meta = new ViewApiKeyIndexResponseMeta(apiKeys)
  }
}
