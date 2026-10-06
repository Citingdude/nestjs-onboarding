import { Controller, Get, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiOkResponse } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ViewContactDetailUseCase } from './view-contact-detail.use-case.js'
import { ViewContactDetailResponse } from './view-contact-detail.response.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { McpTool } from '#src/modules/mcp/decorators/mcp-tool.decorator.js'

@ApiTags('Contact')
@ApiOAuth2([])
@Controller()
export class ViewContactDetailController {
  constructor (
    private readonly viewContactDetailUseCase: ViewContactDetailUseCase
  ) { }

  @Get('contacts/:uuid')
  @Version('1')
  @Permissions(Permission.CONTACT_READ)
  @ApiOkResponse({ type: ViewContactDetailResponse })
  @McpTool({
    name: 'view_contact_detail',
    title: 'View contact',
    description: 'Retrieve the complete details of one contact by its stable identifier.',
    behavior: 'read'
  })
  public async viewContactDetail (
    @UuidParam('uuid') uuid: ContactUuid
  ): Promise<ViewContactDetailResponse> {
    return this.viewContactDetailUseCase.execute(uuid)
  }
}
