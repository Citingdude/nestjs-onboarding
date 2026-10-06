import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiOkResponse } from '@nestjs/swagger'
import { ViewExportIndexQuery } from './view-export-index.query.js'
import { ViewExportIndexResponse } from './view-export-index.response.js'
import { ViewExportIndexUseCase } from './view-export-index.use-case.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

@ApiTags('Export')
@ApiOAuth2([])
@Controller({ path: 'exports', version: '1' })
export class ViewExportIndexController {
  constructor (
    private readonly useCase: ViewExportIndexUseCase,
    private readonly authContext: AuthContext
  ) {}

  @Get()
  @Permissions(Permission.EXPORT_READ)
  @ApiOkResponse({ type: ViewExportIndexResponse })
  public async viewIndex (
    @Query() query: ViewExportIndexQuery
  ): Promise<ViewExportIndexResponse> {
    return this.useCase.execute(query, this.authContext.getUserUuidOrFail())
  }
}
