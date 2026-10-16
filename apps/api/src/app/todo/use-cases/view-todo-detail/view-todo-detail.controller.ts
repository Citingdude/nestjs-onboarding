import { Controller, Get, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ViewTodoDetailUseCase } from '#src/app/todo/use-cases/view-todo-detail/view-todo-detail.use-case.js'
import { ViewTodoDetailResponse } from '#src/app/todo/use-cases/view-todo-detail/view-todo-detail.response.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Todo')
@ApiOAuth2([])
@Controller()
export class ViewTodoDetailController {
  constructor (
    private readonly viewTodoDetailUseCase: ViewTodoDetailUseCase
  ) {}

  @Get('todos/:uuid')
  @Version('1')
  @Permissions(Permission.TODO_READ)
  @ApiOkResponse({ type: ViewTodoDetailResponse })
  public async viewTodoDetail (
    @UuidParam('uuid') uuid: TodoUuid
  ): Promise<ViewTodoDetailResponse> {
    return this.viewTodoDetailUseCase.execute(uuid)
  }
}
