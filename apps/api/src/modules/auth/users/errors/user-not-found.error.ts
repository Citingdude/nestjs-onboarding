import { NotFoundApiError } from '@wisemen/api-error'
import { ApiErrorCode } from '@wisemen/api-error'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class UserNotFoundError extends NotFoundApiError {
  @ApiErrorCode('user_not_found')
  code = 'user_not_found'

  meta: never

  constructor (userUuid?: UserUuid) {
    super(`User ${userUuid ?? ''} not found`)
  }
}
