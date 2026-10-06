import type { Permission } from '#src/modules/auth/permission/permission.enum.js'

export class PermissionSet {
  private permissions: Permission[]
  readonly hasAllPermissions: boolean

  constructor (permissions: Permission[], hasAllPermissions: boolean) {
    this.permissions = permissions
    this.hasAllPermissions = hasAllPermissions
  }

  hasAny (permissions: Permission[]): boolean {
    if (this.hasAllPermissions) {
      return true
    }

    return permissions.some(p => this.permissions.includes(p))
  }

  hasAll (requiredPermissions: Permission[]): boolean {
    if (this.hasAllPermissions) {
      return true
    }

    for (const requiredPermission of requiredPermissions) {
      if (!this.permissions.some(p => p === requiredPermission)) {
        return false
      }
    }

    return true
  }
}
