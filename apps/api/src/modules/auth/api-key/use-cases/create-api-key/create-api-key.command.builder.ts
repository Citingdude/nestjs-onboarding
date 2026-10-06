import { CreateApiKeyCommand } from './create-api-key.command.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

export class CreateApiKeyCommandBuilder {
  private command: CreateApiKeyCommand

  constructor () {
    this.command = new CreateApiKeyCommand()
    this.command.name = 'Primary integration key'
    this.command.permissions = [Permission.CONTACT_READ]
    this.command.expiresAt = null
  }

  withName (name: string): this {
    this.command.name = name
    return this
  }

  withPermissions (permissions: Permission[]): this {
    this.command.permissions = permissions
    return this
  }

  withExpiresAt (expiresAt: string | null): this {
    this.command.expiresAt = expiresAt
    return this
  }

  build (): CreateApiKeyCommand {
    return this.command
  }
}
