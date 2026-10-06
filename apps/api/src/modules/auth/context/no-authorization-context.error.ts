import { ApiErrorCode } from '@wisemen/api-error'
import { UnauthorizedApiError } from '@wisemen/api-error'

export class NoAuthorizationContextError extends UnauthorizedApiError {
  @ApiErrorCode('no_authorization_context')
  readonly code = 'no_authorization_context'

  readonly meta: never

  constructor () {
    super('Unauthorized: No authorization context found')
  }
}
