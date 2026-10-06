import { ApiProperty } from '@nestjs/swagger'
import { getPermissionGroup } from './get-permission-group.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { PermissionApiProperty } from '#src/modules/auth/permission/permission.api-property.js'
import { tcr } from '#src/modules/localization/helpers/translate.helper.js'

class ViewPermissionIndexPermissionResponse {
  @ApiProperty({ type: String })
  name: string

  @PermissionApiProperty()
  key: Permission

  @ApiProperty({ type: String })
  description: string

  constructor (permission: Permission) {
    this.key = permission
    this.name = tcr('permissions.' + permission + '.name')
    this.description = tcr('permissions.' + permission + '.description')
  }
}

class ViewPermissionIndexGroupResponse {
  @ApiProperty({ type: String })
  name: string

  @ApiProperty({ type: ViewPermissionIndexPermissionResponse, isArray: true })
  permissions: ViewPermissionIndexPermissionResponse[]

  constructor (groupKey: string, permissions: Permission[]) {
    this.name = tcr('permissions.' + groupKey + '.group-name')
    this.permissions = permissions.map(p => new ViewPermissionIndexPermissionResponse(p))
  }
}

export class ViewPermissionIndexResponse {
  @ApiProperty({ type: ViewPermissionIndexGroupResponse, isArray: true })
  groups: ViewPermissionIndexGroupResponse[]

  constructor (permissions: Permission[]) {
    const groups: Map<string, Permission[]> = new Map()
    for (const permission of permissions) {
      const groupKey = getPermissionGroup(permission)
      const groupMembers = groups.get(groupKey) ?? []
      groupMembers.push(permission)
      groups.set(groupKey, groupMembers)
    }

    this.groups = []
    for (const [groupKey, permissions] of groups.entries()) {
      this.groups.push(new ViewPermissionIndexGroupResponse(groupKey, permissions))
    }
  }
}
