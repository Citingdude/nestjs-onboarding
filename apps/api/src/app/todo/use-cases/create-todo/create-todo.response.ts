import { ApiProperty } from '@nestjs/swagger'
import type { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

export class CreateTodoResponse {
  @ApiProperty({ type: String })
  uuid: TodoUuid

  constructor (todo: Todo) {
    this.uuid = todo.uuid
  }
}
