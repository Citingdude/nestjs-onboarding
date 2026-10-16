import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { DeleteTodoUseCase } from './delete-todo.use-case.js'
import { DeleteTodoController } from './delete-todo.controller.js'
import { DeleteTodoRepository } from './delete-todo.repository.js'
import { Todo } from '#src/app/todo/entities/todo.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo])
  ],
  controllers: [
    DeleteTodoController
  ],
  providers: [
    DeleteTodoUseCase,
    DeleteTodoRepository
  ]
})
export class DeleteTodoModule { }
