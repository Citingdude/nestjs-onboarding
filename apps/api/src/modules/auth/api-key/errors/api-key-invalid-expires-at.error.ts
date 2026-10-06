import { ApiErrorCode, BadRequestApiError } from '@wisemen/api-error'

export class ApiKeyInvalidExpiresAtError extends BadRequestApiError {
  @ApiErrorCode('api_key_invalid_expires_at')
  code = 'api_key_invalid_expires_at'

  meta: never

  constructor () {
    super('Api key expiresAt must be a future date')
  }
}
