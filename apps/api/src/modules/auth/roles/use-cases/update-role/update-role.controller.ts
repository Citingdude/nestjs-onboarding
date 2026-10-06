import { Body, Controller, HttpCode, HttpStatus, Post, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiNoContentResponse } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { UpdateRoleUseCase } from './update-role.use-case.js'
import { UpdateRoleCommand } from './update-role.command.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'

@ApiTags('Role')
@Controller()
@ApiOAuth2([])
export class UpdateRoleController {
  constructor (
    private readonly useCase: UpdateRoleUseCase
  ) {}

  @Post('roles/:role')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.ROLE_UPDATE)
  @ApiErrorResponse(RoleNotFoundError)
  @ApiNoContentResponse()
  async updateRole (
    @Body() updateRoleCommand: UpdateRoleCommand,
    @UuidParam('role') uuid: RoleUuid
  ): Promise<void> {
    await this.useCase.execute(uuid, updateRoleCommand)
  }
}
