import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Controller, Get, Version } from '@nestjs/common'
import { ApiErrorResponse } from '@wisemen/api-error'
import { ViewMeUseCase } from './view-me.use-case.js'
import { ViewMeResponse } from './view-me.response.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'
import { McpTool } from '#src/modules/mcp/decorators/mcp-tool.decorator.js'

@ApiTags('User')
@ApiOAuth2([])
@Controller()
export class ViewMeController {
  constructor (
    private readonly useCase: ViewMeUseCase,
    private readonly authContext: AuthContext
  ) {}

  @Get('users/me')
  @Version('1')
  @ApiOkResponse({
    description: 'User details retrieved',
    type: ViewMeResponse
  })
  @ApiErrorResponse(UserNotFoundError)
  @McpTool({
    name: 'view_me',
    title: 'View current user',
    description: 'Retrieve the profile of the currently authenticated user.',
    behavior: 'read'
  })
  async viewMe (): Promise<ViewMeResponse> {
    const userUuid = this.authContext.getUserUuidOrFail()
    const user = await this.useCase.viewMe(userUuid)

    return new ViewMeResponse(user)
  }
}
