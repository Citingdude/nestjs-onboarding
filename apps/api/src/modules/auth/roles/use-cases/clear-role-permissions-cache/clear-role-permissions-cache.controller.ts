import { Controller, Post, Body, HttpCode, HttpStatus, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiNoContentResponse } from '@nestjs/swagger'
import { ClearRolePermissionsCacheUseCase } from './clear-role-permissions-cache.use-case.js'
import { ClearRolePermissionsCacheCommand } from './clear-role-permissions-cache.command.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('Role')
@Controller()
@ApiOAuth2([])
@McpExclude('Permission-cache clearing is an operational maintenance action.')
export class ClearRolePermissionsCacheController {
  constructor (
    private readonly useCase: ClearRolePermissionsCacheUseCase
  ) {}

  @Post('roles/clear-cache')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Permissions(Permission.ROLE_CACHE_CLEAR)
  async clearCache (
    @Body() command: ClearRolePermissionsCacheCommand
  ): Promise<void> {
    await this.useCase.execute(command.roleUuids ?? undefined)
  }
}
