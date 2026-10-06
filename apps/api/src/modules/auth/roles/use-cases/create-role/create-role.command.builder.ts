import { CreateRoleCommand } from './create-role.command.js'

export class CreateRoleCommandBuilder {
  private readonly command: CreateRoleCommand

  constructor () {
    this.command = new CreateRoleCommand()
    this.command.name = 'roleName'
  }

  withName (name: string): this {
    this.command.name = name
    return this
  }

  build (): CreateRoleCommand {
    return this.command
  }
}
