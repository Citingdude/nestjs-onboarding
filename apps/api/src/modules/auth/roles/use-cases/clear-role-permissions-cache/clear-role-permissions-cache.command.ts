import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsOptional, IsUUID } from 'class-validator'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class ClearRolePermissionsCacheCommand {
  @ApiProperty({
    type: 'string',
    isArray: true,
    format: 'uuid',
    required: false,
    nullable: true,
    description: 'clears the cache for all roles when omitted or null'
  })
  @IsOptional()
  @IsUUID('all', { each: true })
  @IsArray()
  @ArrayMinSize(1)
  roleUuids?: RoleUuid[] | null
}
