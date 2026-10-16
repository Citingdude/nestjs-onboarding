import { Module } from '@nestjs/common'
import { CreateTodoModule } from '#src/app/todo/use-cases/create-todo/create-todo.module.js'
import { ViewTodoIndexModule } from '#src/app/todo/use-cases/view-todo-index/view-todo-index.module.js'

@Module({
  imports: [
    CreateTodoModule,
    ViewTodoIndexModule
  ]
})
export class TodoModule {}
