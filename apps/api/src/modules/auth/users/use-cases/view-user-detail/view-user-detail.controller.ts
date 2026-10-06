import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Controller, Get, Version } from '@nestjs/common'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { ViewUserDetailUseCase } from './view-user-detail.use-case.js'
import { ViewUserDetailResponse } from './view-user-detail.response.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'

@ApiTags('User')
@ApiOAuth2([])
@Controller()
export class ViewUserDetailController {
  constructor (
    private readonly useCase: ViewUserDetailUseCase
  ) {}

  @Get('users/:uuid')
  @Version('1')
  @Permissions(Permission.USER_READ)
  @ApiOkResponse({
    description: 'User details retrieved',
    type: ViewUserDetailResponse
  })
  @ApiErrorResponse(UserNotFoundError)
  async viewUser (
    @UuidParam('uuid') userUuid: UserUuid
  ): Promise<ViewUserDetailResponse> {
    const user = await this.useCase.viewUser(userUuid)

    return new ViewUserDetailResponse(user)
  }
}
