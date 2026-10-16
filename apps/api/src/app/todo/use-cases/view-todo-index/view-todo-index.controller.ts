import { Controller, Get, Query, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ViewTodoIndexUseCase } from '#src/app/todo/use-cases/view-todo-index/view-todo-index.use-case.js'
import { ViewTodoIndexQuery } from '#src/app/todo/use-cases/view-todo-index/query/view-todo-index.query.js'
import { ViewTodoIndexResponse } from '#src/app/todo/use-cases/view-todo-index/view-todo-index.response.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Todo')
@ApiOAuth2([])
@Controller()
export class ViewTodoIndexController {
  constructor (
    private readonly viewTodoIndexUseCase: ViewTodoIndexUseCase
  ) {}

  @Get('todos')
  @Version('1')
  @Permissions(Permission.TODO_READ)
  @ApiOkResponse({ type: ViewTodoIndexResponse })
  public async viewTodoIndex (
    @Query() query: ViewTodoIndexQuery
  ): Promise<ViewTodoIndexResponse> {
    return this.viewTodoIndexUseCase.execute(query)
  }
}
