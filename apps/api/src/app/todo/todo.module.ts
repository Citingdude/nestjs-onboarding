import { Module } from '@nestjs/common'
import { CreateTodoModule } from '#src/app/todo/use-cases/create-todo/create-todo.module.js'

@Module({
  imports: [
    CreateTodoModule
  ]
})
export class TodoModule {}
