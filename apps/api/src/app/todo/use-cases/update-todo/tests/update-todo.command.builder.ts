import { generateUuid } from '@wisemen/nestjs-common'
import { UpdateTodoCommand } from '#src/app/todo/use-cases/update-todo/update-todo.command.js'

export class UpdateTodoCommandBuilder {
  private command: UpdateTodoCommand

  constructor () {
    this.command = new UpdateTodoCommand()
    this.command.title = generateUuid()
    this.command.description = null
    this.command.deadline = null
    this.command.completed = false
  }

  withTitle (title: string): this {
    this.command.title = title
    return this
  }

  withDescription (description: string | null): this {
    this.command.description = description
    return this
  }

  withDeadline (deadline: string | null): this {
    this.command.deadline = deadline
    return this
  }

  withCompleted (completed: boolean): this {
    this.command.completed = completed
    return this
  }

  build (): UpdateTodoCommand {
    return this.command
  }
}
