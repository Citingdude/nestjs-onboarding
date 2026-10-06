import { Controller, Delete, HttpCode, HttpStatus, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { DeleteApiKeyUseCase } from './delete-api-key.use-case.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import { ApiKeyNotFoundError } from '#src/modules/auth/api-key/errors/api-key.not-found.error.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@ApiTags('ApiKey')
@ApiOAuth2([])
@Controller()
export class DeleteApiKeyController {
  constructor (
    private useCase: DeleteApiKeyUseCase,
    private authContext: AuthContext
  ) { }

  @Delete('api-keys/:uuid')
  @Version('1')
  @Permissions(Permission.API_KEY_DELETE, Permission.API_KEY_DELETE_OWN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiErrorResponse(ApiKeyNotFoundError)
  async deleteApiKey (
    @UuidParam('uuid') uuid: ApiKeyUuid
  ): Promise<void> {
    const auth = this.authContext.getAuthOrFail()
    const permissions = await this.authContext.getPermissions()
    await this.useCase.execute(uuid, auth, permissions)
  }
}
