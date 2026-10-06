import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { Permission } from './permission.enum.js'

export function PermissionApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: Permission,
    enumName: 'Permission'
  })
}
