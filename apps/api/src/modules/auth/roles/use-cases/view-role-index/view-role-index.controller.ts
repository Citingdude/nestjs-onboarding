import { Controller, Get, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiOkResponse } from '@nestjs/swagger'
import { ViewRoleIndexResponse } from './view-role-index.response.js'
import { ViewRoleIndexUseCase } from './view-role-index.use-case.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('Role')
@Controller()
@ApiOAuth2([])
export class ViewRoleIndexController {
  constructor (
    private readonly useCase: ViewRoleIndexUseCase
  ) {}

  @Get('roles')
  @Version('1')
  @ApiOkResponse({
    description: 'The roles has been successfully received.',
    type: ViewRoleIndexResponse
  })
  @Permissions(Permission.ROLE_READ)
  async getRoles (): Promise<ViewRoleIndexResponse> {
    return await this.useCase.execute()
  }
}
