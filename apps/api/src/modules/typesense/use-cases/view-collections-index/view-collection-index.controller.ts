import { Controller, Get, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiOkResponse } from '@nestjs/swagger'
import { ViewCollectionIndexUseCase } from './view-collection-index.use-case.js'
import { ViewCollectionIndexResponse } from './view-collection.index.response.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('Typesense')
@ApiOAuth2([])
@Controller()
@McpExclude('Typesense collection inspection is an operational search-administration endpoint.')
export class ViewCollectionIndexController {
  constructor (
    private readonly viewTypesenseIndexUseCase: ViewCollectionIndexUseCase
  ) { }

  @Get('typesense/collections')
  @Version('1')
  @Permissions(Permission.TYPESENSE)
  @ApiOkResponse({ type: ViewCollectionIndexResponse })
  public viewTypesenseIndex (): ViewCollectionIndexResponse {
    const collections = this.viewTypesenseIndexUseCase.execute()

    return new ViewCollectionIndexResponse(collections)
  }
}
