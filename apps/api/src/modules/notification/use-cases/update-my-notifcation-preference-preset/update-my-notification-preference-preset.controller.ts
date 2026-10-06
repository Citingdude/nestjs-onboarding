import { Body, Controller, HttpCode, HttpStatus, Patch, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { UpdateNotificationPresetPreferenceUseCase } from './update-my-notification-preference-preset.use-case.js'
import { UpdateMyNotificationPreferencePresetCommand } from './update-my-notification-preference-preset.command.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('Notification Preference')
@ApiOAuth2([])
@Controller()
export class UpdateMyNotificationPreferencePresetController {
  constructor (
    private readonly useCase: UpdateNotificationPresetPreferenceUseCase
  ) {}

  @Patch('me/notification-preferences/preset')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_PREFERENCES_UPDATE_PRESET)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateNotificationPresetPreference (
    @Body() command: UpdateMyNotificationPreferencePresetCommand
  ): Promise<void> {
    await this.useCase.execute(command)
  }
}
