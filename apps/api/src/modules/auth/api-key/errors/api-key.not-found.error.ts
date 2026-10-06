import { ApiErrorCode, NotFoundApiError } from '@wisemen/api-error'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'

export class ApiKeyNotFoundError extends NotFoundApiError {
  @ApiErrorCode('api_key_not_found')
  code = 'api_key_not_found'

  meta: never

  constructor (apiKeyUuid: ApiKeyUuid) {
    super(`ApiKey with uuid ${apiKeyUuid} not found`)
  }
}
