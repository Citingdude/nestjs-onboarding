import { Body, Controller, Post, Version } from '@nestjs/common'
import { ApiCreatedResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { SendPushNotificationUseCase } from './send-push-notification.use-case.js'
import { SendPushNotificationCommand } from './send-push-notification.command.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@Controller()
@ApiTags('OneSignal')
@ApiOAuth2([])
@McpExclude('This endpoint sends a real notification to people.')
export class SendPushNotificationController {
  constructor (
    private readonly sendPushNotificationUseCase: SendPushNotificationUseCase
  ) {}

  @Post('onesignal/push-notification')
  @Version('1')
  @Permissions(Permission.SEND_PUSH_NOTIFICATION)
  @ApiCreatedResponse()
  sendPushNotification (
    @Body() command: SendPushNotificationCommand
  ) {
    return this.sendPushNotificationUseCase.execute(command)
  }
}
