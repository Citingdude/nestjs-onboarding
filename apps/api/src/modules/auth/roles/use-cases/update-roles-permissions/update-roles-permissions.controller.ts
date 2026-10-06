import { Body, Controller, HttpCode, HttpStatus, Patch, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponse } from '@wisemen/api-error'
import { UpdateRolesPermissionsUseCase } from './update-roles-permissions.use-case.js'
import { UpdateRolesPermissionsCommand } from './update-roles-permissions.command.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Role')
@ApiOAuth2([])
@Controller()
export class UpdateRolesPermissionsController {
  constructor (
    private readonly useCase: UpdateRolesPermissionsUseCase
  ) {}

  @Patch('roles')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.ROLE_UPDATE)
  @ApiNoContentResponse()
  @ApiErrorResponse(RoleNotFoundError)
  async updateRolePermissions (
    @Body() command: UpdateRolesPermissionsCommand
  ): Promise<void> {
    await this.useCase.updateRolePermissions(command)
  }
}
