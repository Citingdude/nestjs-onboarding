import { IsArray, IsEnum, IsObject, IsUUID, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { PermissionApiProperty } from '#src/modules/auth/permission/permission.api-property.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class UpdateRolesPermissionsCommandItem {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  roleUuid: RoleUuid

  @PermissionApiProperty({ isArray: true })
  @IsEnum(Permission, { each: true })
  permissions: Permission[]
}

export class UpdateRolesPermissionsCommand {
  @ApiProperty({ type: UpdateRolesPermissionsCommandItem, isArray: true })
  @ValidateNested({ each: true })
  @IsObject({ each: true })
  @IsArray()
  @Type(() => UpdateRolesPermissionsCommandItem)
  roles: UpdateRolesPermissionsCommandItem[]
}
