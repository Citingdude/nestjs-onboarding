import { Controller, Get, Query, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ViewDomainEventLogIndexUseCase } from './view-domain-event-log-index.use-case.js'
import { ViewDomainEventLogIndexResponse } from './view-domain-event-log-index.response.js'
import { ViewDomainEventLogIndexQuery } from './view-domain-event-log-index.query.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'

@ApiTags('Event log')
@ApiOAuth2([])
@Controller()
export class ViewDomainEventLogIndexController {
  constructor (
    private readonly useCase: ViewDomainEventLogIndexUseCase
  ) {}

  @Get('event-logs')
  @Version('1')
  @Permissions(Permission.EVENT_LOG_READ)
  @ApiOkResponse({ type: ViewDomainEventLogIndexResponse })
  async getLogs (
    @Query() query: ViewDomainEventLogIndexQuery
  ): Promise<ViewDomainEventLogIndexResponse> {
    return await this.useCase.getLogs(query)
  }
}
