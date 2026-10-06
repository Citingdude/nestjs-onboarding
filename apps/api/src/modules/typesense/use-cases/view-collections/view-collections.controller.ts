import { Controller, Get, Version } from '@nestjs/common'
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection.js'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ViewCollectionsUseCase } from './view-collections.use-case.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('Typesense')
@Controller()
@ApiOAuth2([])
@McpExclude('Typesense collection inspection is an operational search-administration endpoint.')
export class ViewCollectionsController {
  constructor (private readonly viewCollectionsUseCase: ViewCollectionsUseCase) {}

  @Get('typesense/collections/details')
  @Version('1')
  @ApiOkResponse()
  @Permissions(Permission.TYPESENSE)
  async getCollections (): Promise<CollectionSchema[]> {
    return await this.viewCollectionsUseCase.execute()
  }
}
