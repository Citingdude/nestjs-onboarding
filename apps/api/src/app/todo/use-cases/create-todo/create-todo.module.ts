import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { Todo } from '#src/app/todo/entities/todo.entity.js'
import { CreateTodoController } from '#src/app/todo/use-cases/create-todo/create-todo.controller.js'
import { CreateTodoUseCase } from '#src/app/todo/use-cases/create-todo/create-todo.use-case.js'
import { CreateTodoRepository } from '#src/app/todo/use-cases/create-todo/create-todo.repository.js'

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  controllers: [CreateTodoController],
  providers: [
    CreateTodoUseCase,
    CreateTodoRepository
  ],
  exports: []
})
export class CreateTodoModule {}
