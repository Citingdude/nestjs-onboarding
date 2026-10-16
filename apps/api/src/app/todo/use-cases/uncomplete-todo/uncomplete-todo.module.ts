import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { UncompleteTodoUseCase } from './uncomplete-todo.use-case.js'
import { UncompleteTodoController } from './uncomplete-todo.controller.js'
import { UncompleteTodoRepository } from './uncomplete-todo.repository.js'
import { Todo } from '#src/app/todo/entities/todo.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo])
  ],
  controllers: [
    UncompleteTodoController
  ],
  providers: [
    UncompleteTodoUseCase,
    UncompleteTodoRepository
  ]
})
export class UncompleteTodoModule { }
