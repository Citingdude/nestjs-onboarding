import { Controller, Post, Body, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiCreatedResponse } from '@nestjs/swagger'
import { ImpersonateUserCommand } from './impersonate-user.command.js'
import { ImpersonateUserUseCase } from './impersonate-user.use-case.js'
import { ImpersonateUserResponse } from './impersonate-user.response.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Impersonation')
@Controller()
@ApiOAuth2([])
export class ImpersonateUserController {
  constructor (
    private readonly useCase: ImpersonateUserUseCase,
    private readonly authContext: AuthContext
  ) {}

  @Post('impersonation')
  @Version('1')
  @ApiCreatedResponse({ type: ImpersonateUserResponse })
  @Permissions(Permission.USER_IMPERSONATE)
  async impersonateUser (
    @Body() command: ImpersonateUserCommand
  ): Promise<ImpersonateUserResponse> {
    return await this.useCase.execute(command, this.authContext.getUserUuidOrFail())
  }
}
