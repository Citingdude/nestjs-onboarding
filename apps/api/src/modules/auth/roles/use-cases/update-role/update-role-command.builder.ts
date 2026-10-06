import { UpdateRoleCommand } from './update-role.command.js'

export class UpdateRoleCommandBuilder {
  private command: UpdateRoleCommand

  constructor () {
    this.command = new UpdateRoleCommand()
    this.command.name = 'roleName'
  }

  withName (name: string): this {
    this.command.name = name

    return this
  }

  build (): UpdateRoleCommand {
    return this.command
  }
}
