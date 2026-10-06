import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export interface AuthenticatedUser {
  type: 'user'
  userUuid: UserUuid
  userId: string
}

export interface AuthenticatedApiKey {
  type: 'api-key'
  apiKeyUuid: ApiKeyUuid
  permissions: Permission[]
  userUuid: UserUuid
  userId: string
}

export type AuthPrincipal = AuthenticatedUser | AuthenticatedApiKey
