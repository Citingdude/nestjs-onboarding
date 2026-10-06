import { MimeType } from '#src/modules/files/enums/mime-type.enum.js'
import { CreateFileCommand } from '#src/modules/files/use-cases/create-file/create-file.command.js'

export class CreateFileCommandBuilder {
  private command: CreateFileCommand

  constructor () {
    this.reset()
  }

  reset (): this {
    this.command = new CreateFileCommand()

    this.command.name = 'test.png'
    this.command.mimeType = MimeType.PNG
    this.command.isPublic = 'false'

    return this
  }

  withName (name: string): this {
    this.command.name = name

    return this
  }

  withMimeType (mimeType: MimeType): this {
    this.command.mimeType = mimeType

    return this
  }

  withIsPublic (isPublic: string): this {
    this.command.isPublic = isPublic

    return this
  }

  build (): CreateFileCommand {
    const result = this.command

    this.reset()

    return result
  }
}
