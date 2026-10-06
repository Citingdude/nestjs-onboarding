import { ApiErrorCode } from '@wisemen/api-error'
import { ApiErrorMeta } from '@wisemen/api-error'
import { BadRequestApiError } from '@wisemen/api-error'
import { NotificationType, NotificationTypeApiProperty } from '#src/modules/notification/enums/notification-types.enum.js'

class MigrationAlreadyPerformedErrorMeta {
  @NotificationTypeApiProperty({ isArray: true })
  readonly type: NotificationType

  constructor (type: NotificationType) {
    this.type = type
  }
}

export class MigrationAlreadyPerformedError extends BadRequestApiError {
  @ApiErrorCode('migration_already_performed')
  readonly code = 'migration_already_performed'

  @ApiErrorMeta()
  readonly meta: MigrationAlreadyPerformedErrorMeta

  constructor (type: NotificationType) {
    super(`The migrations are already performed for the type: ${type}`)
    this.meta = new MigrationAlreadyPerformedErrorMeta(type)
  }
}
