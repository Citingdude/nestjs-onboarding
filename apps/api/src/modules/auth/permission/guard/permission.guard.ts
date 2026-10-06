import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '#src/modules/auth/permission/permission.decorator.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor (
    private reflector: Reflector,
    private authContext: AuthContext
  ) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (requiredPermissions == null) {
      return true
    }

    return await this.authContext.hasAnyPermission(requiredPermissions)
  }
}
