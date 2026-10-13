import { generateUuid } from '@wisemen/nestjs-common'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

export class TodoBuilder {
  private todo: Todo

  constructor () {
    this.todo = new Todo()
    this.todo.uuid = generateUuid<TodoUuid>()
    this.todo.createdAt = new Date()
    this.todo.updatedAt = new Date()
    this.todo.title = generateUuid()
    this.todo.description = null
    this.todo.completed = false
    this.todo.deadline = null
  }

  withUuid (todoUuid: TodoUuid) {
    this.todo.uuid = todoUuid

    return this
  }

  withUserUuid (userUuid: UserUuid) {
    this.todo.userUuid = userUuid

    return this
  }

  withTitle (title: string) {
    this.todo.title = title

    return this
  }

  withDescription (description: string | null) {
    this.todo.description = description

    return this
  }

  withDeadline (deadline: Date | null): this {
    this.todo.deadline = deadline
    return this
  }

  build (): Todo {
    return this.todo
  }
}
