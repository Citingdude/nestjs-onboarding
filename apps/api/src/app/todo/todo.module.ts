import { Module } from '@nestjs/common'
import { CreateTodoModule } from '#src/app/todo/use-cases/create-todo/create-todo.module.js'
import { ViewTodoIndexModule } from '#src/app/todo/use-cases/view-todo-index/view-todo-index.module.js'
import { ViewTodoDetailModule } from '#src/app/todo/use-cases/view-todo-detail/view-todo-detail.module.js'
import { UpdateTodoModule } from '#src/app/todo/use-cases/update-todo/update-todo.module.js'

@Module({
  imports: [
    CreateTodoModule,
    ViewTodoIndexModule,
    ViewTodoDetailModule,
    UpdateTodoModule
  ]
})
export class TodoModule {}
