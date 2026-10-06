import { Controller, Get, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiOkResponse } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { ViewRoleDetailUseCase } from './view-role-detail.use-case.js'
import { ViewRoleDetailResponse } from './view-role-detail.response.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'

@ApiTags('Role')
@Controller()
@ApiOAuth2([])
export class ViewRoleDetailController {
  constructor (
    private readonly useCase: ViewRoleDetailUseCase
  ) {}

  @Get('roles/:role')
  @Version('1')
  @ApiOkResponse({
    description: 'The role has been successfully received.',
    type: ViewRoleDetailResponse
  })
  @ApiErrorResponse(RoleNotFoundError)
  @Permissions(Permission.ROLE_READ)
  async getRole (
    @UuidParam('role') uuid: RoleUuid
  ): Promise<ViewRoleDetailResponse> {
    return await this.useCase.execute(uuid)
  }
}
