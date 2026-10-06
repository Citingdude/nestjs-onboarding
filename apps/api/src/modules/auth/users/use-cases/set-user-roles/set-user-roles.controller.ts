import { Body, Controller, Post, Version } from '@nestjs/common'
import { ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { SetUserRolesUseCase } from './set-user-roles.use-case.js'
import { SetUserRolesCommand } from './set-user-roles.command.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'

@ApiTags('User')
@ApiOAuth2([])
@Controller()
export class SetUserRolesController {
  constructor (
    private readonly useCase: SetUserRolesUseCase
  ) {}

  @Post('users/:user/role')
  @Version('1')
  @Permissions(Permission.USER_UPDATE)
  @ApiErrorResponse(UserNotFoundError)
  async updateUser (
    @UuidParam('user') userUuid: UserUuid,
    @Body() dto: SetUserRolesCommand
  ): Promise<void> {
    await this.useCase.execute(userUuid, dto)
  }
}
