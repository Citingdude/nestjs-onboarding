import assert from 'assert'
import { ApiProperty } from '@nestjs/swagger'
import type { User } from '#src/modules/auth/users/entities/user.entity.js'
import { ViewRoleDetailResponse } from '#src/modules/auth/roles/use-cases/view-role-detail/view-role-detail.response.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class ViewMeResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: UserUuid

  @ApiProperty({ type: String, format: 'email' })
  email: string

  @ApiProperty({ type: String, nullable: true, example: 'John' })
  firstName: string | null

  @ApiProperty({ type: String, nullable: true, example: 'Doe' })
  lastName: string | null

  @ApiProperty({ type: () => ViewRoleDetailResponse, isArray: true })
  roles: ViewRoleDetailResponse[]

  constructor (user: User) {
    assert(user.userRoles != null)

    this.uuid = user.uuid
    this.email = user.email
    this.firstName = user.firstName
    this.lastName = user.lastName
    this.roles = user.userRoles.map((userRole) => {
      assert(userRole.role != null)

      return new ViewRoleDetailResponse(userRole.role)
    })
  }
}
