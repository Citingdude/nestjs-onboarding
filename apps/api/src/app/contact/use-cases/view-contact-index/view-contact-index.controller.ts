import { Controller, Get, Query, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiOkResponse } from '@nestjs/swagger'
import { ViewContactIndexQuery } from './query/view-contact-index.query.js'
import { ViewContactIndexResponse } from './view-contact-index.response.js'
import { ViewContactIndexUseCase } from './view-contact-index.use-case.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { McpTool } from '#src/modules/mcp/decorators/mcp-tool.decorator.js'

@ApiTags('Contact')
@ApiOAuth2([])
@Controller()
export class ViewContactIndexController {
  constructor (
    private readonly viewContactIndexUseCase: ViewContactIndexUseCase
  ) { }

  @Get('contacts')
  @Version('1')
  @Permissions(Permission.CONTACT_READ)
  @ApiOkResponse({ type: ViewContactIndexResponse })
  @McpTool({
    name: 'view_contact_index',
    title: 'List contacts',
    description: 'Find and paginate contacts using the supplied filters and sorting.',
    behavior: 'read'
  })
  public async viewContactIndex (
    @Query() query: ViewContactIndexQuery
  ): Promise<ViewContactIndexResponse> {
    return this.viewContactIndexUseCase.execute(query)
  }
}
