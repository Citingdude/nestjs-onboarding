import { Controller, HttpCode, HttpStatus, Patch, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { MarkAllNotificationAsReadUseCase } from './mark-all-notification-as-read.use-case.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@ApiTags('Notification')
@ApiOAuth2([])
@Controller()
export class MarkAllNotificationAsReadController {
  constructor (
    private readonly authContext: AuthContext,
    private readonly useCase: MarkAllNotificationAsReadUseCase
  ) {}

  @Patch('me/notifications/mark-as-read')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_UPDATE_READ)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async markNotificationsAsRead (): Promise<void> {
    await this.useCase.execute(this.authContext.getUserUuidOrFail())
  }
}
