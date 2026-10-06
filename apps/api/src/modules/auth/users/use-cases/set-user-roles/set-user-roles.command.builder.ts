import { SetUserRolesCommand } from './set-user-roles.command.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class SetUserRolesCommandBuilder {
  private readonly command: SetUserRolesCommand

  constructor () {
    this.command = new SetUserRolesCommand()
    this.command.roleUuids = []
  }

  withRoleUuids (roleUuids: RoleUuid[]): this {
    this.command.roleUuids = roleUuids

    return this
  }

  build (): SetUserRolesCommand {
    return this.command
  }
}
