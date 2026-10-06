import { ApiErrorCode } from '@wisemen/api-error'
import { UnauthorizedApiError } from '@wisemen/api-error'

export class UserNotFoundAfterCreationError extends UnauthorizedApiError {
  @ApiErrorCode('user_not_found_after_creation')
  readonly code = 'user_not_found_after_creation'

  readonly meta: never

  constructor () {
    super('Unauthorized: User not found after creation')
  }
}
