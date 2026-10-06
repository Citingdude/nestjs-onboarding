import { Controller, Delete, HttpCode, HttpStatus, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiNoContentResponse } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { DeleteRoleUseCase } from './delete-role.use-case.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'

@ApiTags('Role')
@Controller()
@ApiOAuth2([])
export class DeleteRoleController {
  constructor (
    private readonly useCase: DeleteRoleUseCase
  ) {}

  @Delete('roles/:role')
  @Version('1')
  @Permissions(Permission.ROLE_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiErrorResponse(RoleNotFoundError)
  async deleteRole (
    @UuidParam('role') uuid: RoleUuid
  ): Promise<void> {
    await this.useCase.execute(uuid)
  }
}
