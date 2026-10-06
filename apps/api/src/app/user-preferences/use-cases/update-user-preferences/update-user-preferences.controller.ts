import { Body, Controller, Patch, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { UpdateUserPreferencesCommand } from './update-user-preferences.command.js'
import { UpdateUserPreferencesUseCase } from './update-user-preferences.use-case.js'

@ApiTags('Preference')
@ApiOAuth2([])
@Controller()
export class UpdateUserPreferencesController {
  constructor (
    private readonly updatePreferencesUseCase: UpdateUserPreferencesUseCase
  ) {}

  @Patch('me/user-preferences')
  @Version('1')
  @ApiOkResponse()
  public async updatePreferences (
    @Body() updatePreferencesCommand: UpdateUserPreferencesCommand
  ): Promise<void> {
    return this.updatePreferencesUseCase.execute(updatePreferencesCommand)
  }
}
