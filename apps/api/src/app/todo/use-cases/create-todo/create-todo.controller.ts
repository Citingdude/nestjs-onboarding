import { Body, Controller, Post, Version } from '@nestjs/common'
import { ApiCreatedResponse } from '@nestjs/swagger'
import { CreateTodoUseCase } from '#src/app/todo/use-cases/create-todo/create-todo.use-case.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { CreateTodoResponse } from '#src/app/todo/use-cases/create-todo/create-todo.response.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { CreateTodoCommand } from '#src/app/todo/use-cases/create-todo/create-todo.command.js'

@Controller()
export class CreateTodoController {
  constructor (
    private useCase: CreateTodoUseCase,
    private authContext: AuthContext
  ) {}

  @Post('/todos')
  @Version('1')
  @ApiCreatedResponse({ type: CreateTodoResponse })
  @Permissions(Permission.TODO_CREATE)
  async createTodo (
    @Body() createTodoCommand: CreateTodoCommand
  ): Promise<CreateTodoResponse> {
    const userUuid = this.authContext.getUserUuidOrFail()
    return this.useCase.execute(createTodoCommand, userUuid)
  }
}
