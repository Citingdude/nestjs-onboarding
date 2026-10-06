import { Controller, Get, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { GetNotificationTypesConfigResponse } from './get-notification-types-config.response.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { NOTIFICATION_TYPES_CONFIG } from '#src/modules/notification/notification-types-config.js'

@ApiTags('Notification Preference')
@ApiOAuth2([])
@Controller()
export class GetNotificationTypesConfigController {
  @Get('notification-preferences/config')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_READ_CONFIG)
  @ApiOkResponse({ type: GetNotificationTypesConfigResponse })
  getNotificationPreferencesConfig (): GetNotificationTypesConfigResponse {
    return new GetNotificationTypesConfigResponse(NOTIFICATION_TYPES_CONFIG)
  }
}
