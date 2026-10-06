import assert from 'assert'
import { ApiProperty } from '@nestjs/swagger'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { PermissionApiProperty } from '#src/modules/auth/permission/permission.api-property.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import { ApiKeySecret } from '#src/modules/auth/api-key/api-key-secret.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class CreateApiKeyResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: ApiKeyUuid

  @ApiProperty({ type: String, example: 'Primary integration key' })
  name: string

  @PermissionApiProperty({ isArray: true })
  permissions: Permission[]

  @ApiProperty({ type: String, format: 'uuid' })
  userUuid: UserUuid

  @ApiProperty({ type: String })
  userEmail: string

  @ApiProperty({ type: String, example: '**********************************************abcde' })
  maskedKey: string

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  expiresAt: string | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string

  @ApiProperty({ type: String })
  apiKey: string

  constructor (apiKey: ApiKey, secret: ApiKeySecret) {
    assert(apiKey.user !== undefined, 'user relation not loaded')

    this.uuid = apiKey.uuid
    this.name = apiKey.name
    this.permissions = apiKey.permissions
    this.userUuid = apiKey.userUuid
    this.userEmail = apiKey.user.email
    this.createdAt = apiKey.createdAt.toISOString()
    this.expiresAt = apiKey.expiresAt?.toISOString() ?? null
    this.apiKey = secret.value
    this.maskedKey = secret.maskedValue
  }
}
