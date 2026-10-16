import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import { ViewTodoDetailController } from '#src/app/todo/use-cases/view-todo-detail/view-todo-detail.controller.js'
import { ViewTodoDetailUseCase } from '#src/app/todo/use-cases/view-todo-detail/view-todo-detail.use-case.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo])
  ],
  controllers: [
    ViewTodoDetailController
  ],
  providers: [
    ViewTodoDetailUseCase
  ]
})
export class ViewTodoDetailModule {}
