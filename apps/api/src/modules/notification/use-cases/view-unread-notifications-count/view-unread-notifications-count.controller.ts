import { Controller, Get, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ViewUnreadNotificationsCountResponse } from './view-unread-notifications-count.response.js'
import { ViewUnreadNotificationsCountUseCase } from './view-unread-notifications-count.use-case.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('Notification')
@ApiOAuth2([])
@Controller()
export class ViewUnreadNotificationsCountController {
  constructor (
    private readonly useCase: ViewUnreadNotificationsCountUseCase
  ) {}

  @Get('me/notifications/unread-count')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_READ_OWN)
  @ApiOkResponse({ type: ViewUnreadNotificationsCountResponse })
  async getUnreadCount (): Promise<ViewUnreadNotificationsCountResponse> {
    return await this.useCase.execute()
  }
}
