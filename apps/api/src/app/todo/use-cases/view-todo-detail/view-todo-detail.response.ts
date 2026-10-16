import { ApiProperty } from '@nestjs/swagger'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class ViewTodoDetailResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: TodoUuid

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: string

  @ApiProperty({ type: String })
  title: string

  @ApiProperty({ type: String, nullable: true })
  description: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deadline: string | null

  @ApiProperty({ type: Boolean })
  completed: boolean

  @ApiProperty({ type: String, format: 'uuid' })
  userUuid: UserUuid

  constructor (todo: Todo) {
    this.uuid = todo.uuid
    this.createdAt = todo.createdAt.toISOString()
    this.updatedAt = todo.updatedAt.toISOString()
    this.title = todo.title
    this.description = todo.description
    this.deadline = todo.deadline?.toISOString() ?? null
    this.completed = todo.completed
    this.userUuid = todo.userUuid
  }
}
