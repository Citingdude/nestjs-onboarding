import { Controller, HttpCode, HttpStatus, Patch, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { MarkNotificationAsReadUseCase } from './mark-notification-as-read.use-case.js'
import { UserNotificationNotFoundError } from '#src/modules/notification/errors/user-notification-not-found.error.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'

@ApiTags('Notification')
@ApiOAuth2([])
@Controller()
export class MarkNotificationAsReadController {
  constructor (
    private readonly useCase: MarkNotificationAsReadUseCase
  ) {}

  @Patch('me/notifications/:notificationUuid/mark-as-read')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_UPDATE_READ)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiErrorResponse(UserNotificationNotFoundError)
  async markNotificationAsRead (
    @UuidParam('notificationUuid') notificationUuid: NotificationUuid
  ): Promise<void> {
    await this.useCase.execute(notificationUuid)
  }
}
