import { Injectable } from '@nestjs/common'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'
import { RoleCache } from '#src/modules/auth/roles/cache/role-cache.js'
import { UserRoleCache } from '#src/modules/auth/users/cache/user-role/user-role-cache.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { PermissionSet } from '#src/modules/auth/permission/permission-set.js'

@Injectable()
export class AuthorizationService {
  constructor (
    private userRoleCache: UserRoleCache,
    private roleCache: RoleCache
  ) {}

  async getUserPermissions (userUuid: UserUuid): Promise<Permission[]> {
    const roleUuids = await this.userRoleCache.getUserRoles(userUuid)
    const permissions = await this.roleCache.getRolesPermissions(roleUuids)

    if (permissions.includes(Permission.ALL_PERMISSIONS)) {
      return Object.values(Permission)
    }

    return permissions
  }

  async hasPermissions (auth: AuthPrincipal, requiredPermissions: Permission[]): Promise<boolean> {
    if (requiredPermissions.length === 0) {
      return true
    }

    const permissions = await this.getPermissions(auth)
    return permissions.hasAny(requiredPermissions)
  }

  async getPermissions (auth: AuthPrincipal): Promise<PermissionSet> {
    if (auth.type === 'api-key') {
      const userPermissions = await this.getUserPermissions(auth.userUuid)
      const permissions = auth.permissions.filter(p => userPermissions.includes(p))
      const hasAllPermissions = false

      return new PermissionSet(permissions, hasAllPermissions)
    } else {
      const userPermissions = await this.getUserPermissions(auth.userUuid)
      const hasAllPermissions = userPermissions.includes(Permission.ALL_PERMISSIONS)
      return new PermissionSet(userPermissions, hasAllPermissions)
    }
  }
}
