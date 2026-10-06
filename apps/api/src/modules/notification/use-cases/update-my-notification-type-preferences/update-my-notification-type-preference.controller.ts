import { Body, Controller, HttpCode, HttpStatus, Patch, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { UpdateMyNotificationPreferenceTypeUseCase } from './update-my-notification-type-preference.use-case.js'
import { UpdateMyNotificationTypePreferenceCommand } from './update-my-notification-type-preference.command.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('Notification Preference')
@ApiOAuth2([])
@Controller()
export class UpdateMyNotificationTypePreferenceController {
  constructor (
    private readonly useCase: UpdateMyNotificationPreferenceTypeUseCase
  ) {}

  @Patch('me/notification-preferences/types')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_PREFERENCES_UPDATE_TYPES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateNotificationPreferenceTypes (
    @Body() command: UpdateMyNotificationTypePreferenceCommand
  ): Promise<void> {
    await this.useCase.execute(command)
  }
}
