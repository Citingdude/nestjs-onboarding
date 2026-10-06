import { Controller, Get, Query, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ImportCollectionsUseCase } from './import-collections.use-case.js'
import { ImportTypesenseQuery } from './import-collections.query.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('Typesense')
@Controller()
@ApiOAuth2([])
@McpExclude('Typesense imports are operational maintenance actions.')
export class ImportCollectionsController {
  constructor (private readonly useCase: ImportCollectionsUseCase) {}

  @Get('typesense/import')
  @Version('1')
  @ApiOkResponse()
  @Permissions(Permission.TYPESENSE)
  async import (
    @Query() query: ImportTypesenseQuery
  ): Promise<void> {
    await this.useCase.execute(query.collections)
  }
}
