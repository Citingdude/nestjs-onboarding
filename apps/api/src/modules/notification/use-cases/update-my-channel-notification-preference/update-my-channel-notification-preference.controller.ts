import { Body, Controller, HttpCode, HttpStatus, Patch, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { UpdateMyChannelNotificationPreferenceUseCase } from './update-my-channel-notification-preference.use-case.js'
import { UpdateMyChannelNotificationPreferenceCommand } from './update-my-channel-notification-preference.command.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('Notification Preference')
@ApiOAuth2([])
@Controller()
export class UpdateMyChannelNotificationPreferenceController {
  constructor (
    private readonly useCase: UpdateMyChannelNotificationPreferenceUseCase
  ) {}

  @Patch('me/notification-preferences/channels')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_PREFERENCES_UPDATE_CHANNEL)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateGlobalNotificationPreferences (
    @Body() command: UpdateMyChannelNotificationPreferenceCommand
  ): Promise<void> {
    await this.useCase.execute(command)
  }
}
