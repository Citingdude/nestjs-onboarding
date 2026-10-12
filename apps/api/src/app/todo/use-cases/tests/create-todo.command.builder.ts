import { generateUuid } from '@wisemen/nestjs-common'
import { CreateTodoCommand } from '#src/app/todo/use-cases/create-todo/create-todo.command.js'

export class CreateTodoCommandBuilder {
  private command: CreateTodoCommand

  constructor () {
    this.command = new CreateTodoCommand()
    this.command.title = generateUuid()
    this.command.description = null
    this.command.deadline = null
  }

  withTitle (title: string): this {
    this.command.title = title
    return this
  }

  withDescription (description: string | null): this {
    this.command.description = description
    return this
  }

  withDeadline (deadline: Date | null): this {
    this.command.deadline = deadline
    return this
  }

  build (): CreateTodoCommand {
    return this.command
  }
}
