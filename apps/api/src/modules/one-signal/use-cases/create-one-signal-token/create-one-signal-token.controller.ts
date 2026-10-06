import { Controller, Post, Version } from '@nestjs/common'
import { ApiCreatedResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { CreateOneSignalTokenUseCase } from './create-one-signal-token.use-case.js'
import { CreateOneSignalTokenResponse } from './create-one-signal-token.response.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@Controller()
@ApiTags('OneSignal')
@ApiOAuth2([])
@McpExclude('OneSignal token creation returns a credential.')
export class CreateOneSignalTokenController {
  constructor (private readonly createTokenUseCase: CreateOneSignalTokenUseCase) {}

  @Post('onesignal/token')
  @Version('1')
  @ApiCreatedResponse({ type: CreateOneSignalTokenResponse })
  createToken (): CreateOneSignalTokenResponse {
    return this.createTokenUseCase.execute()
  }
}
