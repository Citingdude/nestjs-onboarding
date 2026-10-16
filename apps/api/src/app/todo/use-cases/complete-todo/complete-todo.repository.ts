import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

export class CompleteTodoRepository {
  constructor (
    @InjectRepository(Todo) private readonly todoRepo: TypeOrmRepository<Todo>
  ) {}

  async findTodo (uuid: TodoUuid): Promise<Todo | null> {
    return await this.todoRepo.findOne({
      where: { uuid },
      lock: { mode: 'pessimistic_write' }
    })
  }

  async completeTodo (uuid: TodoUuid): Promise<void> {
    await this.todoRepo.update({ uuid }, { completed: true })
  }
}
