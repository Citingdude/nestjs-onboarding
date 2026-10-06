import { Body, Controller, Post, Version } from '@nestjs/common'
import { ApiCreatedResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { RequestDomainEventLogExportCommand } from './request-domain-event-log-export.command.js'
import { RequestDomainEventLogExportResponse } from './request-domain-event-log-export.response.js'
import { RequestDomainEventLogExportUseCase } from './request-domain-event-log-export.use-case.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('Event log')
@ApiOAuth2([])
@Controller()
export class RequestDomainEventLogExportController {
  constructor (
    private useCase: RequestDomainEventLogExportUseCase,
    private authContext: AuthContext
  ) {}

  @Post('event-logs/export')
  @Version('1')
  @Permissions(Permission.EVENT_LOG_EXPORT)
  @ApiCreatedResponse({ type: RequestDomainEventLogExportResponse })
  async requestExport (
    @Body() command: RequestDomainEventLogExportCommand
  ): Promise<RequestDomainEventLogExportResponse> {
    return this.useCase.execute(command, this.authContext.getUserUuidOrFail())
  }
}
