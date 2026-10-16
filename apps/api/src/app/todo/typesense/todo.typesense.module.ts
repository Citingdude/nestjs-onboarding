import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import { TodoTypesenseCollector } from '#src/app/todo/typesense/todo.typesense-collector.js'
import { TodoGlobalSearchCollection } from '#src/app/todo/typesense/todo.global-search.collection.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo])
  ],
  providers: [
    TodoTypesenseCollector,
    TodoGlobalSearchCollection
  ]
})
export class TypesenseTodoModule {}
