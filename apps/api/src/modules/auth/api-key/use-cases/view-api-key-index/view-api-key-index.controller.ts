import { Controller, Get, Query, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiOkResponse } from '@nestjs/swagger'
import { ViewApiKeyIndexQuery } from './view-api-key-index.query.js'
import { ViewApiKeyIndexResponse } from './view-api-key-index.response.js'
import { ViewApiKeyIndexUseCase } from './view-api-key-index.use-case.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@ApiTags('ApiKey')
@ApiOAuth2([])
@Controller()
export class ViewApiKeyIndexController {
  constructor (
    private useCase: ViewApiKeyIndexUseCase,
    private authContext: AuthContext
  ) { }

  @Get('api-keys')
  @Version('1')
  @Permissions(Permission.API_KEY_READ, Permission.API_KEY_READ_OWN)
  @ApiOkResponse({ type: ViewApiKeyIndexResponse })
  async viewApiKeyIndex (
    @Query() query: ViewApiKeyIndexQuery
  ): Promise<ViewApiKeyIndexResponse> {
    const auth = this.authContext.getAuthOrFail()
    const permissions = await this.authContext.getPermissions()
    return await this.useCase.execute(query, auth, permissions)
  }
}
