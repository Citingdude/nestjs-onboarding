import { Body, Controller, HttpCode, HttpStatus, Put, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiNoContentResponse, ApiOperation } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { UpdateContactUseCase } from './update-contact.use-case.js'
import { UpdateContactCommand } from './update-contact.command.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { ContactNotFoundError } from '#src/app/contact/errors/contact.not-found.error.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { McpTool } from '#src/modules/mcp/decorators/mcp-tool.decorator.js'

@ApiTags('Contact')
@ApiOAuth2([])
@Controller()
export class UpdateContactController {
  constructor (
    private readonly updateContactUseCase: UpdateContactUseCase
  ) { }

  @Put('contacts/:uuid')
  @Version('1')
  @Permissions(Permission.CONTACT_UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update contact' })
  @ApiNoContentResponse()
  @ApiErrorResponse(ContactNotFoundError, FileNotFoundError)
  @McpTool({
    name: 'update_contact',
    title: 'Update contact',
    description: 'Replace editable fields on an existing contact.',
    behavior: 'update',
    idempotent: true,
    destructiveReason: 'This tool overwrites editable fields on the selected contact.'
  })
  public async updateContact (
    @UuidParam('uuid') uuid: ContactUuid,
    @Body() command: UpdateContactCommand
  ): Promise<void> {
    await this.updateContactUseCase.execute(uuid, command)
  }
}
