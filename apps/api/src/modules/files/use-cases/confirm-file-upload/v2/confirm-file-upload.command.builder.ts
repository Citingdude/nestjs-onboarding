import { ConfirmFileUploadCommand } from './confirm-file-upload.command.js'

export class ConfirmFileUploadCommandBuilder {
  private command: ConfirmFileUploadCommand

  constructor () {
    this.reset()
  }

  reset (): this {
    this.command = new ConfirmFileUploadCommand()
    return this
  }

  withBlurHash (blurHash: string | null): this {
    this.command.blurHash = blurHash
    return this
  }

  build (): ConfirmFileUploadCommand {
    return this.command
  }
}
