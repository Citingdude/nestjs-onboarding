import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

export class DeleteTodoRepository {
  constructor (
    @InjectRepository(Todo) private readonly todoRepo: TypeOrmRepository<Todo>
  ) {}

  async deleteTodo (uuid: TodoUuid): Promise<boolean> {
    const result = await this.todoRepo.delete({ uuid })
    return result.affected === 1
  }
}
