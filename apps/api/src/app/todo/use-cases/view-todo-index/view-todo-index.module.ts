import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewTodoIndexController } from '#src/app/todo/use-cases/view-todo-index/view-todo-index.controller.js'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import { TypesenseModule } from '#src/modules/typesense/typesense.module.js'
import { ViewTodoIndexUseCase } from '#src/app/todo/use-cases/view-todo-index/view-todo-index.use-case.js'

@Module({
  imports: [
    TypesenseModule,
    TypeOrmModule.forFeature([Todo])
  ],
  controllers: [
    ViewTodoIndexController
  ],
  providers: [
    ViewTodoIndexUseCase
  ]
})
export class ViewTodoIndexModule { }
