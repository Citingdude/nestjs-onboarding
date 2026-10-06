import { ApiErrorCode, ForbiddenApiError } from '@wisemen/api-error'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class TargetNotImpersonatableError extends ForbiddenApiError {
  @ApiErrorCode('target_not_impersonatable')
  code = 'target_not_impersonatable'

  meta: never

  constructor (userUuid?: UserUuid) {
    super(`User ${userUuid ?? ''} cannot be impersonated`)
  }
}
