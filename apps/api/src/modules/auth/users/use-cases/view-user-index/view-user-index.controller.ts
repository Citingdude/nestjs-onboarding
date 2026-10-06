import { ApiOAuth2, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Controller, Get, Query, Version } from '@nestjs/common'
import { ViewUserIndexQuery } from './view-user-index.query.js'
import { ViewUserIndexUseCase } from './view-user-index.use-case.js'
import { ViewUserIndexResponse } from './view-user-index.response.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('User')
@ApiOAuth2([])
@Controller()
export class ViewUserIndexController {
  constructor (
    private readonly useCase: ViewUserIndexUseCase
  ) {}

  @Get('users')
  @Version('1')
  @Permissions(Permission.USER_READ)
  @ApiOperation({ summary: 'View users', description: 'View general information of all users' })
  @ApiOkResponse({
    description: 'Users retrieved',
    type: ViewUserIndexResponse
  })
  async viewUsers (
    @Query() query: ViewUserIndexQuery
  ): Promise<ViewUserIndexResponse> {
    return await this.useCase.viewUsers(query)
  }
}
