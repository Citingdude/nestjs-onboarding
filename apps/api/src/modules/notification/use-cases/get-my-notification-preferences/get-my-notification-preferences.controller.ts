import { Controller, Get, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { GetMyNotificationPreferencesResponse } from './get-my-notification-preferences.response.js'
import { GetMyNotificationPreferencesUseCase } from './get-my-notification-preferences.use-case.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('Notification Preference')
@ApiOAuth2([])
@Controller()
export class GetMyNotificationPreferencesController {
  constructor (
    private readonly useCase: GetMyNotificationPreferencesUseCase
  ) {}

  @Get('me/notification-preferences')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_PREFERENCES_READ_OWN)
  @ApiOkResponse({ type: GetMyNotificationPreferencesResponse })
  async getNotificationPreferences (
  ): Promise<GetMyNotificationPreferencesResponse> {
    return await this.useCase.execute()
  }
}
