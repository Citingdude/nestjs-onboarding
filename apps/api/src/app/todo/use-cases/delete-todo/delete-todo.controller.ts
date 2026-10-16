import { Controller, HttpCode, HttpStatus, Delete, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponse } from '@wisemen/api-error'
import { UuidParam } from '@wisemen/decorators'
import { DeleteTodoUseCase } from './delete-todo.use-case.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Todo')
@ApiOAuth2([])
@Controller()
export class DeleteTodoController {
  constructor (
    private readonly deleteTodoUseCase: DeleteTodoUseCase
  ) {}

  @Delete('todos/:uuid')
  @Version('1')
  @Permissions(Permission.TODO_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete todo' })
  @ApiNoContentResponse()
  @ApiErrorResponse(TodoNotFoundError)
  public async deleteTodo (
    @UuidParam('uuid') uuid: TodoUuid
  ): Promise<void> {
    await this.deleteTodoUseCase.execute(uuid)
  }
}
