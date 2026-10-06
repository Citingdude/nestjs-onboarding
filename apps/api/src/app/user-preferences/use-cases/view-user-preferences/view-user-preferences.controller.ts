import { Controller, Get, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiOkResponse } from '@nestjs/swagger'
import { ViewUserPreferencesResponse } from './view-user-preferences.response.js'
import { ViewUserPreferencesUseCase } from './view-user-preferences.use-case.js'

@ApiTags('Preference')
@ApiOAuth2([])
@Controller()
export class ViewUserPreferencesController {
  constructor (
    private readonly viewPreferencesIndexUseCase: ViewUserPreferencesUseCase
  ) {}

  @Get('me/user-preferences')
  @Version('1')
  @ApiOkResponse({ type: ViewUserPreferencesResponse })
  public async viewPreferencesIndex (): Promise<ViewUserPreferencesResponse> {
    return this.viewPreferencesIndexUseCase.execute()
  }
}
