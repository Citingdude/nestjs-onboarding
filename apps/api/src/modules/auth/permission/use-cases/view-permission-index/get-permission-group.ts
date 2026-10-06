import type { Permission } from '#src/modules/auth/permission/permission.enum.js'

export function getPermissionGroup (permission: Permission): string {
  const dotIndex = permission.indexOf('.')
  if (dotIndex > 0) {
    return permission.substring(0, dotIndex)
  } else {
    return permission
  }
}
