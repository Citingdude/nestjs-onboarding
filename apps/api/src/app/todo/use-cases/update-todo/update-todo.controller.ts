import { Body, Controller, HttpCode, HttpStatus, Put, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponse } from '@wisemen/api-error'
import { UuidParam } from '@wisemen/decorators'
import { UpdateTodoCommand } from './update-todo.command.js'
import { UpdateTodoUseCase } from './update-todo.use-case.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Todo')
@ApiOAuth2([])
@Controller()
export class UpdateTodoController {
  constructor (
    private readonly updateTodoUseCase: UpdateTodoUseCase
  ) {}

  @Put('todos/:uuid')
  @Version('1')
  @Permissions(Permission.TODO_UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update todo' })
  @ApiNoContentResponse()
  @ApiErrorResponse(TodoNotFoundError)
  public async updateTodo (
    @UuidParam('uuid') uuid: TodoUuid,
    @Body() command: UpdateTodoCommand
  ): Promise<void> {
    await this.updateTodoUseCase.execute(uuid, command)
  }
}
