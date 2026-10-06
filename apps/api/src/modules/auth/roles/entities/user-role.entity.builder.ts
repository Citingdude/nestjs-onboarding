import { generateUuid } from '@wisemen/nestjs-common'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class UserRoleBuilder {
  private userRole: UserRole

  constructor () {
    this.userRole = new UserRole()
    this.userRole.userUuid = generateUuid<UserUuid>()
    this.userRole.roleUuid = generateUuid<RoleUuid>()
  }

  withUserUuid (userUuid: UserUuid): this {
    this.userRole.userUuid = userUuid
    return this
  }

  withRoleUuid (roleUuid: RoleUuid): this {
    this.userRole.roleUuid = roleUuid
    return this
  }

  build (): UserRole {
    return this.userRole
  }
}
