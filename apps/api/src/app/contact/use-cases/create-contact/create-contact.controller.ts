import { Body, Controller, Post, Version } from '@nestjs/common'
import { ApiCreatedResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponse } from '@wisemen/api-error'
import { CreateContactCommand } from './create-contact.command.js'
import { CreateContactResponse } from './create-contact.response.js'
import { CreateContactUseCase } from './create-contact.use-case.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import { McpTool } from '#src/modules/mcp/decorators/mcp-tool.decorator.js'

@ApiTags('Contact')
@ApiOAuth2([])
@Controller()
export class CreateContactController {
  constructor (
    private readonly createContactUseCase: CreateContactUseCase
  ) { }

  @Post('contacts')
  @Version('1')
  @Permissions(Permission.CONTACT_CREATE)
  @ApiCreatedResponse({ type: CreateContactResponse })
  @ApiErrorResponse(FileNotFoundError)
  @McpTool({
    name: 'create_contact',
    title: 'Create contact',
    description: 'Create a contact and return its stable identifier.',
    behavior: 'additive'
  })
  public async createContact (
    @Body() createContactCommand: CreateContactCommand
  ): Promise<CreateContactResponse> {
    return this.createContactUseCase.execute(createContactCommand)
  }
}
