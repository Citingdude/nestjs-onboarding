import { randomUUID } from 'crypto'
import type { EntityManager } from 'typeorm'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { UserNotFoundAfterCreationError } from '#src/modules/auth/users/errors/user-not-found-after-creation.error.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import { UserRoleBuilder } from '#src/modules/auth/roles/entities/user-role.entity.builder.js'

export class TestAuthContext {
  private adminRole?: Role
  private defaultRole?: Role

  private users: Map<string, User> = new Map()

  constructor (
    private readonly manager: EntityManager
  ) {}

  public async getAdminRole (): Promise<Role> {
    if (this.adminRole == null) {
      this.adminRole = await this.manager.findOneByOrFail(Role, {
        isSystemAdmin: true
      })
    }

    return this.adminRole
  }

  public async getDefaultRole (): Promise<Role> {
    if (this.defaultRole == null) {
      this.defaultRole = await this.manager.findOneByOrFail(Role, {
        isDefault: true
      })
    }

    return this.defaultRole
  }

  public async getRole (withPermissions: Permission[]): Promise<Role> {
    const role = new RoleBuilder()
      .withName(randomUUID())
      .withPermissions(withPermissions)
      .build()

    await this.manager.insert(Role, role)

    return role
  }

  public async getUser (permissions: Permission[]): Promise<TestUser> {
    const role = await this.getRole(permissions)
    const user = new UserBuilder()
      .withEmail(randomUUID() + '@mail.com')
      .build()

    await this.manager.insert(User, user)

    const userRole = new UserRoleBuilder()
      .withUserUuid(user.uuid)
      .withRoleUuid(role.uuid)
      .build()

    await this.manager.insert(UserRole, userRole)

    const token = this.getToken(user)

    userRole.role = role
    user.userRoles = [userRole]

    return { user, token }
  }

  public async getDefaultUser (): Promise<TestUser> {
    const defaultRole = await this.getDefaultRole()
    const defaultUser = new UserBuilder()
      .withEmail(randomUUID() + '@mail.com')
      .build()

    await this.manager.insert(User, defaultUser)

    const defaultUserRole = new UserRoleBuilder()
      .withUserUuid(defaultUser.uuid)
      .withRoleUuid(defaultRole.uuid)
      .build()

    await this.manager.insert(UserRole, defaultUserRole)

    const token = this.getToken(defaultUser)

    defaultUserRole.role = defaultRole
    defaultUser.userRoles = [defaultUserRole]

    return { user: defaultUser, token }
  }

  public async getRandomUser (): Promise<TestUser> {
    const randomUser = new UserBuilder()
      .withEmail(randomUUID() + '@mail.com')
      .build()

    await this.manager.insert(User, randomUser)

    const token = this.getToken(randomUser)

    return { user: randomUser, token }
  }

  public resolveUser (token: string): User {
    const user = this.users.get(token)

    if (user == null) {
      throw new UserNotFoundAfterCreationError()
    }

    return user
  }

  public getToken (user: User): string {
    const token = randomUUID()

    this.users.set(token, user)

    return token
  }
}
