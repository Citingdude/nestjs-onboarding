import { Controller, Delete, HttpCode, HttpStatus, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { DeleteContactUseCase } from './delete-contact.use-case.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { ContactNotFoundError } from '#src/app/contact/errors/contact.not-found.error.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { McpTool } from '#src/modules/mcp/decorators/mcp-tool.decorator.js'

@ApiTags('Contact')
@ApiOAuth2([])
@Controller()
export class DeleteContactController {
  constructor (
    private readonly deleteContactUseCase: DeleteContactUseCase
  ) { }

  @Delete('contacts/:uuid')
  @Version('1')
  @Permissions(Permission.CONTACT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiErrorResponse(ContactNotFoundError)
  @McpTool({
    name: 'delete_contact',
    title: 'Delete contact',
    description: 'Delete an existing contact by its stable identifier.',
    behavior: 'remove',
    idempotent: true,
    destructiveReason: 'This tool removes the selected contact from active application data.'
  })
  public async deleteContact (
    @UuidParam('uuid') uuid: ContactUuid
  ): Promise<void> {
    await this.deleteContactUseCase.execute(uuid)
  }
}
