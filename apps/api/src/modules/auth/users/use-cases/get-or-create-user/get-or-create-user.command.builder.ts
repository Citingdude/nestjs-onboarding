import { GetOrCreateUserCommand } from './get-or-create-user.command.js'

export class GetOrCreateUserCommandBuilder {
  private readonly command: GetOrCreateUserCommand

  constructor () {
    this.command = new GetOrCreateUserCommand()
    this.command.email = 'john.doe@mail.com'
    this.command.firstName = null
    this.command.lastName = null
    this.command.id = '1'
  }

  withEmail (email: string): this {
    this.command.email = email

    return this
  }

  withFirstName (firstName: string | null): this {
    this.command.firstName = firstName

    return this
  }

  withLastName (lastName: string | null): this {
    this.command.lastName = lastName

    return this
  }

  withId (id: string): this {
    this.command.id = id

    return this
  }

  build (): GetOrCreateUserCommand {
    return this.command
  }
}
