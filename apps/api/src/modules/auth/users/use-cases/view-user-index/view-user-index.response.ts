import { ApiProperty } from '@nestjs/swagger'
import { PaginatedOffsetResponse } from '@wisemen/pagination'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import type { TypesenseUser } from '#src/modules/auth/users/typesense/user.typesense-collection.js'

class UserIndexRoleView {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: RoleUuid

  @ApiProperty({ type: String })
  name: string

  constructor (role: Role) {
    this.uuid = role.uuid
    this.name = role.name
  }
}

class UserIndexView {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: UserUuid

  @ApiProperty({ type: String, format: 'email' })
  email: string

  @ApiProperty({ type: String, nullable: true, example: 'John' })
  firstName: string | null

  @ApiProperty({ type: String, nullable: true, example: 'Doe' })
  lastName: string | null

  @ApiProperty({ type: UserIndexRoleView, isArray: true })
  roles: UserIndexRoleView[]

  constructor (user: TypesenseUser, roles: Role[]) {
    this.uuid = user.id
    this.email = user.email
    this.firstName = user.firstName ?? null
    this.lastName = user.lastName ?? null
    this.roles = roles.map(role => new UserIndexRoleView(role))
  }
}

export class ViewUserIndexResponse extends PaginatedOffsetResponse<UserIndexView> {
  @ApiProperty({ type: UserIndexView, isArray: true })
  declare items: UserIndexView[]

  constructor (users: PaginatedOffsetResponse<TypesenseUser>, userRoles: Map<UserUuid, Role[]>) {
    const userViews = users.items.map((user) => {
      const roles = userRoles.get(user.id) ?? []
      return new UserIndexView(user, roles)
    })

    super(userViews, users.meta)
  }
}
