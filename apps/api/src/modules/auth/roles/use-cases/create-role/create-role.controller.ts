import { Controller, Post, Body, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiCreatedResponse } from '@nestjs/swagger'
import { CreateRoleCommand } from './create-role.command.js'
import { CreateRoleUseCase } from './create-role.use-case.js'
import { CreateRoleResponse } from './create-role.response.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Role')
@Controller()
@ApiOAuth2([])
export class CreateRoleController {
  constructor (
    private readonly useCase: CreateRoleUseCase
  ) {}

  @Post('roles')
  @Version('1')
  @ApiCreatedResponse({ type: CreateRoleResponse })
  @Permissions(Permission.ROLE_CREATE)
  async createRole (
    @Body() createRoleCommand: CreateRoleCommand
  ): Promise<CreateRoleResponse> {
    return await this.useCase.execute(createRoleCommand)
  }
}
