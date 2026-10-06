import { ApiProperty } from '@nestjs/swagger'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class RoleResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: RoleUuid

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty()
  name: string

  @ApiProperty({ enum: Permission, enumName: 'Permission', isArray: true })
  permissions: Permission[]

  @ApiProperty()
  isDefault: boolean

  @ApiProperty()
  isSystemAdmin: boolean

  constructor (role: Role) {
    this.uuid = role.uuid
    this.createdAt = role.createdAt
    this.updatedAt = role.updatedAt
    this.name = role.name
    this.permissions = role.permissions
    this.isDefault = role.isDefault
    this.isSystemAdmin = role.isSystemAdmin
  }
}

export class ViewRoleIndexResponse {
  @ApiProperty({ type: RoleResponse, isArray: true })
  declare items: RoleResponse[]

  constructor (items: Role[]) {
    const result = items.map(role => new RoleResponse(role))

    return { items: result }
  }
}
