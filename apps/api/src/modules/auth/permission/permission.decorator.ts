import { applyDecorators, SetMetadata } from '@nestjs/common'
import { ApiExtension } from '@nestjs/swagger'
import type { Permission } from './permission.enum.js'

export const PERMISSIONS_KEY = 'permissions'

/** The authorization context must hold ANY permission specified */
export function Permissions (...permissions: Permission[]): MethodDecorator {
  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    ApiExtension('x-permissions', permissions)
  )
}
