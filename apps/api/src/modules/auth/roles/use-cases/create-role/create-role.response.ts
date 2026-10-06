import { ApiProperty } from '@nestjs/swagger'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class CreateRoleResponse {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: RoleUuid

  constructor (roleUuid: RoleUuid) {
    this.uuid = roleUuid
  }
}
