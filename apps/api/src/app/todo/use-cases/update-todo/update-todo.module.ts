import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { UpdateTodoUseCase } from './update-todo.use-case.js'
import { UpdateTodoController } from './update-todo.controller.js'
import { UpdateTodoRepository } from './update-todo.repository.js'
import { Todo } from '#src/app/todo/entities/todo.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo])
  ],
  controllers: [
    UpdateTodoController
  ],
  providers: [
    UpdateTodoUseCase,
    UpdateTodoRepository
  ]
})
export class UpdateTodoModule { }
