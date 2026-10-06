import { Controller, Get, Query, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { GetMyNotificationsResponse } from './get-my-notifications.response.js'
import { GetMyNotificationsUseCase } from './get-my-notifications.use-case.js'
import { GetMyNotificationsQuery } from './query/get-my-notifications.query.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Notification')
@ApiOAuth2([])
@Controller()
export class GetMyNotificationsController {
  constructor (
    private readonly useCase: GetMyNotificationsUseCase
  ) {}

  @Get('me/notifications')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_READ_OWN)
  @ApiOkResponse({ type: GetMyNotificationsResponse })
  async getNotifications (
    @Query() query: GetMyNotificationsQuery
  ): Promise<GetMyNotificationsResponse> {
    return await this.useCase.getNotifications(query)
  }
}
