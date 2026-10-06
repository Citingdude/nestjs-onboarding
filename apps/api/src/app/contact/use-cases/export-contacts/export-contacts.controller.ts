import { Controller, Post, Version } from '@nestjs/common'
import { ApiCreatedResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { ExportContactsUseCase } from './export-contacts.use-case.js'
import { ExportContactsResponse } from './export-contacts.response.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('Contact')
@ApiOAuth2([])
@Controller()
@McpExclude('Exports are asynchronous file-producing workflows and need a dedicated MCP design.')
export class ExportContactsController {
  constructor (
    private useCase: ExportContactsUseCase,
    private authContext: AuthContext
  ) {}

  @Post('contacts/export')
  @Version('1')
  @Permissions(Permission.CONTACT_EXPORT)
  @ApiCreatedResponse({ type: ExportContactsResponse })
  async exportContacts (): Promise<ExportContactsResponse> {
    return this.useCase.execute(this.authContext.getUserUuidOrFail())
  }
}
