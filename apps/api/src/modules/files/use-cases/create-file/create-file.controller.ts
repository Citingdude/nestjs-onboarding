import { Controller, Post, Body, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiCreatedResponse } from '@nestjs/swagger'
import { CreateFileCommand } from './create-file.command.js'
import { CreateFileUseCase } from './create-file.use-case.js'
import { CreateFileResponse } from './create-file.response.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@ApiTags('File')
@Controller()
@ApiOAuth2([])
@McpExclude('File creation initiates a binary upload workflow.')
export class CreateFileController {
  constructor (
    private readonly useCase: CreateFileUseCase,
    private authContext: AuthContext
  ) {}

  @Post('files')
  @Version('1')
  @Permissions(Permission.FILE_CREATE)
  @ApiCreatedResponse({
    type: CreateFileResponse
  })
  async createFile (
    @Body() command: CreateFileCommand
  ): Promise<CreateFileResponse> {
    const userUuid = this.authContext.getUserUuid()
    return await this.useCase.execute(command, userUuid)
  }
}
