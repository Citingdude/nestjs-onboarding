import { Controller, Get, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ViewWebFeatureFlagsResponse } from './view-web-feature-flags.response.js'
import { ViewWebFeatureFlagsUseCase } from './view-web-feature-flags.use-case.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('Feature Flag')
@ApiOAuth2([])
@Controller()
@McpExclude('Web feature flags are an operational frontend configuration endpoint.')
export class ViewWebFeatureFlagsController {
  constructor (
    private useCase: ViewWebFeatureFlagsUseCase
  ) {}

  @Get('me/feature-flags')
  @Version('1')
  @ApiOkResponse({ type: ViewWebFeatureFlagsResponse })
  async viewWebFeatureFlags (): Promise<ViewWebFeatureFlagsResponse> {
    return await this.useCase.execute()
  }
}
