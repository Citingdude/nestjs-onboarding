import { Controller, Get, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ViewPermissionIndexResponse } from './view-permission-index.response.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('Permission')
@ApiOAuth2([])
@Controller()
export class ViewPermissionIndexController {
  @Get('permissions')
  @Version('1')
  @ApiOkResponse({ type: ViewPermissionIndexResponse })
  getPermissions (): ViewPermissionIndexResponse {
    return new ViewPermissionIndexResponse(Object.values(Permission))
  }
}
