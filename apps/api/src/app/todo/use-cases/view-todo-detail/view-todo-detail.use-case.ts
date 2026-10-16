import { Injectable } from '@nestjs/common'
import { InjectRepository, readonly, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { ViewTodoDetailResponse } from '#src/app/todo/use-cases/view-todo-detail/view-todo-detail.response.js'

@Injectable()
export class ViewTodoDetailUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(Todo)
    private readonly todoRepository: TypeOrmRepository<Todo>
  ) {}

  public async execute (uuid: TodoUuid): Promise<ViewTodoDetailResponse> {
    const todo = await readonly(this.dataSource, async () =>
      await this.todoRepository.findOneOrFail({ where: { uuid } })
    )

    return new ViewTodoDetailResponse(todo)
  }
}
