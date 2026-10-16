import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

export class UpdateTodoRepository {
  constructor (
    @InjectRepository(Todo) private readonly todoRepo: TypeOrmRepository<Todo>
  ) {}

  async findTodo (uuid: TodoUuid): Promise<Todo | null> {
    return await this.todoRepo.findOneBy({ uuid })
  }

  async updateTodo (todo: Todo): Promise<void> {
    await this.todoRepo.save(todo)
  }
}
