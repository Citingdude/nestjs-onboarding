import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { CompleteTodoUseCase } from './complete-todo.use-case.js'
import { CompleteTodoController } from './complete-todo.controller.js'
import { CompleteTodoRepository } from './complete-todo.repository.js'
import { Todo } from '#src/app/todo/entities/todo.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo])
  ],
  controllers: [
    CompleteTodoController
  ],
  providers: [
    CompleteTodoUseCase,
    CompleteTodoRepository
  ]
})
export class CompleteTodoModule { }
