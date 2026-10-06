import { ApiProperty } from '@nestjs/swagger'
import { ApiErrorCode } from '@wisemen/api-error'
import { ApiErrorMeta } from '@wisemen/api-error'
import { BadRequestApiError } from '@wisemen/api-error'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class RoleNotEditableErrorMeta {
  @ApiProperty({
    format: 'uuid',
    required: true,
    description: 'the role uuid which cannot be edited'
  })
  readonly uuid: RoleUuid

  @ApiProperty({
    required: true,
    description: 'the role name which cannot be edited',
    example: 'default'
  })
  readonly name: string

  constructor (role: Role) {
    this.uuid = role.uuid
    this.name = role.name
  }
}

export class RoleNotEditableError extends BadRequestApiError {
  @ApiErrorCode('role_not_editable')
  readonly code = 'role_not_editable'

  @ApiErrorMeta()
  readonly meta: RoleNotEditableErrorMeta

  constructor (role: Role) {
    super(`This role is not editable`)
    this.meta = new RoleNotEditableErrorMeta(role)
  }
}
