import { Body, Controller, Post, Version } from '@nestjs/common'
import { ApiCreatedResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponse } from '@wisemen/api-error'
import { CreateApiKeyCommand } from './create-api-key.command.js'
import { CreateApiKeyResponse } from './create-api-key.response.js'
import { CreateApiKeyUseCase } from './create-api-key.use-case.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { ApiKeyInvalidPermissionsError } from '#src/modules/auth/api-key/errors/api-key-invalid-permissions.error.js'
import { ApiKeyInvalidExpiresAtError } from '#src/modules/auth/api-key/errors/api-key-invalid-expires-at.error.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('ApiKey')
@ApiOAuth2([])
@Controller()
@McpExclude('API-key creation returns a credential and must not be exposed as an MCP tool.')
export class CreateApiKeyController {
  constructor (
    private useCase: CreateApiKeyUseCase,
    private authContext: AuthContext
  ) { }

  @Post('api-keys')
  @Version('1')
  @Permissions(Permission.API_KEY_CREATE)
  @ApiCreatedResponse({ type: CreateApiKeyResponse })
  @ApiErrorResponse(ApiKeyInvalidPermissionsError, ApiKeyInvalidExpiresAtError)
  async createApiKey (
    @Body() createApiKeyCommand: CreateApiKeyCommand
  ): Promise<CreateApiKeyResponse> {
    const userUuid = this.authContext.getUserUuidOrFail()
    const userPermissions = await this.authContext.getPermissions()
    return await this.useCase.execute(createApiKeyCommand, userUuid, userPermissions)
  }
}
