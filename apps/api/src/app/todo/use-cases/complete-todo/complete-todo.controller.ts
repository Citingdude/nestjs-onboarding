import { Controller, HttpCode, HttpStatus, Patch, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponse } from '@wisemen/api-error'
import { UuidParam } from '@wisemen/decorators'
import { CompleteTodoUseCase } from './complete-todo.use-case.js'
import { TodoNotFoundError } from '#src/app/todo/errors/todo.not-found.error.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Todo')
@ApiOAuth2([])
@Controller()
export class CompleteTodoController {
  constructor (
    private readonly completeTodoUseCase: CompleteTodoUseCase
  ) {}

  @Patch('todos/:uuid/complete')
  @Version('1')
  @Permissions(Permission.TODO_UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Complete todo' })
  @ApiNoContentResponse()
  @ApiErrorResponse(TodoNotFoundError)
  public async completeTodo (
    @UuidParam('uuid') uuid: TodoUuid
  ): Promise<void> {
    await this.completeTodoUseCase.execute(uuid)
  }
}
