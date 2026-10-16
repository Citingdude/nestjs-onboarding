import { ApiProperty } from '@nestjs/swagger'
import { PaginatedOffsetResponse } from '@wisemen/pagination'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import type { TypesenseTodo } from '#src/app/todo/typesense/todo.typesense-collection.js'

export class TodoResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: TodoUuid

  @ApiProperty({ type: String })
  title: string

  @ApiProperty({ type: String, nullable: true })
  description: string | null

  @ApiProperty({ type: Date, nullable: true })
  deadline: Date | null

  @ApiProperty({ type: Boolean })
  completed: boolean

  constructor (todo: TypesenseTodo) {
    this.uuid = todo.id
    this.title = todo.title
    this.description = todo.description ?? null
    this.deadline = todo.deadline !== undefined
      ? new Date(todo.deadline)
      : null
    this.completed = todo.completed
  }
}

export class ViewTodoIndexResponse extends PaginatedOffsetResponse<TodoResponse> {
  @ApiProperty({ type: TodoResponse, isArray: true })
  declare items: TodoResponse[]

  constructor (todos: PaginatedOffsetResponse<TypesenseTodo>) {
    const todoItems = todos.items.map(todo => new TodoResponse(todo))

    super(todoItems, todos.meta)
  }
}
