import { Body, Controller, HttpCode, HttpStatus, Post, Version } from '@nestjs/common'
import { ApiNoContentResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponse } from '@wisemen/api-error'
import { MigrateNotificationTypesUseCase } from './migrate-notification-types.use-case.js'
import { MigrateNotificationTypesCommand } from './migrate-notification-types.command.js'
import { MigrationAlreadyPerformedError } from '#src/modules/notification/errors/migration-already-performed.error.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('Notification')
@ApiOAuth2([])
@Controller()
@McpExclude('Notification migrations are operational maintenance actions.')
export class MigrateNotificationTypesController {
  constructor (
    private readonly useCase: MigrateNotificationTypesUseCase
  ) {}

  @Post('notifications/migrate')
  @Version('1')
  @Permissions(Permission.NOTIFICATION_MIGRATE_TYPE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiErrorResponse(MigrationAlreadyPerformedError)
  async migrateNotificationTypes (
    @Body() command: MigrateNotificationTypesCommand
  ): Promise<void> {
    await this.useCase.execute(command)
  }
}
