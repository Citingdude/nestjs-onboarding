import { Controller, Get, HttpStatus, Version } from '@nestjs/common'
import { ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { OneOfApiResponse } from '@wisemen/one-of'
import { ApiErrorResponse } from '@wisemen/api-error'
import { ViewUserNotificationDetailUseCase } from './view-user-notification-detail.use-case.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'
import { NotificationResponse } from '#src/modules/notification/notification.response.js'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'
import { UserNotificationNotFoundError } from '#src/modules/notification/errors/user-notification-not-found.error.js'

@ApiTags('Notification')
@ApiOAuth2([])
@Controller()
export class ViewUserNotificationDetailController {
  constructor (
    private readonly useCase: ViewUserNotificationDetailUseCase
  ) {}

  @Get('me/notifications/:notificationUuid')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_READ_OWN)
  @OneOfApiResponse(Notification, { status: HttpStatus.OK })
  @ApiErrorResponse(UserNotificationNotFoundError)
  async getNotificationDetail (
    @UuidParam('notificationUuid') notificationUuid: NotificationUuid
  ): Promise<NotificationResponse> {
    return await this.useCase.execute(notificationUuid)
  }
}
