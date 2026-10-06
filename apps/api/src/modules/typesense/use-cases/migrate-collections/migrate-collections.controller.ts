import { Controller, Get, Query, Version } from '@nestjs/common'
import { ApiOAuth2, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { MigrateCollectionsUseCase } from './migrate-collections.use-case.js'
import { MigrateTypesenseQuery } from './migrate-collections.query.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('Typesense')
@Controller()
@ApiOAuth2([])
@McpExclude('Typesense migrations are operational maintenance actions.')
export class MigrateCollectionsController {
  constructor (private readonly migrateCollectionsUseCase: MigrateCollectionsUseCase) {}

  @Get('typesense/migrate')
  @Version('1')
  @ApiOkResponse()
  @Permissions(Permission.TYPESENSE)
  async migrate (
    @Query() query: MigrateTypesenseQuery
  ): Promise<void> {
    await this.migrateCollectionsUseCase.execute(query.fresh, query.collections)
  }
}
