import { ApiErrorCode } from '@wisemen/api-error'
import { NotFoundApiError } from '@wisemen/api-error'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

export class TodoNotFoundError extends NotFoundApiError {
  @ApiErrorCode('todo_not_found')
  code: 'todo_not_found'

  meta: never

  constructor (todoUuid: TodoUuid) {
    super(`Todo with uuid ${todoUuid} not found`)
    this.code = 'todo_not_found'
  }
}
