import { InjectRepository } from '@nestjs/typeorm'
import type { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Todo } from '#src/app/todo/entities/todo.entity.js'

export class CreateTodoRepository {
  constructor (
    @InjectRepository(Todo) private readonly todoRepo: TypeOrmRepository<Todo>
  ) {}

  async insert (todo: Todo): Promise<void> {
    await this.todoRepo.insert(todo)
  }
}
