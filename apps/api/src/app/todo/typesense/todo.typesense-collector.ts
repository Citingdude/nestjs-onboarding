import { RegisterTypesenseCollector, type TypesenseCollector } from '@wisemen/nestjs-typesense'
import { InjectRepository } from '@nestjs/typeorm'
import { AnyOrIgnore, type TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { MoreThanOrEqual } from 'typeorm'
import type { TodoCollection, TypesenseTodo } from '#src/app/todo/typesense/todo.typesense-collection.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

@RegisterTypesenseCollector(TypesenseCollectionName.TODO)
export class TodoTypesenseCollector implements TypesenseCollector<TodoCollection> {
  static readonly BATCH_SIZE = 10_000

  constructor (
    @InjectRepository(Todo) private todoRepository: TypeOrmRepository<Todo>
  ) {}

  transform (todos: Todo[]): TypesenseTodo[] {
    return todos.map(todo => this.transformTodo(todo))
  }

  fetch (uuids?: TodoUuid[]): AsyncGenerator<Todo[], void, void> {
    return this.todoRepository.findByInBatches({
      uuid: AnyOrIgnore(uuids)
    }, TodoTypesenseCollector.BATCH_SIZE)
  }

  fetchChanged (since: Date): AsyncGenerator<Todo[], void, void> {
    return this.todoRepository.findByInBatches({
      updatedAt: MoreThanOrEqual(since)
    }, TodoTypesenseCollector.BATCH_SIZE)
  }

  private transformTodo (todo: Todo): TypesenseTodo {
    return {
      id: todo.uuid,
      title: todo.title,
      completed: todo.completed,
      deadline: todo.deadline?.toDateString(),
      description: todo.description ?? undefined
    }
  }
}
