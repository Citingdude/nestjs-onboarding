import { Body, Controller, HttpCode, HttpStatus, Post, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { SendTestNotificationUseCase } from './send-test-notification.use-case.js'
import { SendTestNotificationCommand } from './send-test-notification.command.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('Notification')
@ApiOAuth2([])
@Controller()
@McpExclude('This endpoint sends a real test notification.')
export class SendTestNotificationController {
  constructor (
    private readonly useCase: SendTestNotificationUseCase,
    private readonly authContext: AuthContext
  ) {}

  @Post('notifications/test-notification')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_SEND_TEST)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async sendTestNotification (
    @Body() command: SendTestNotificationCommand
  ): Promise<void> {
    await this.useCase.execute(command, this.authContext.getUserUuidOrFail())
  }
}
