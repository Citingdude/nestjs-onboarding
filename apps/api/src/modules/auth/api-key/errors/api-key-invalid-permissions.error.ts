import { ApiErrorCode, BadRequestApiError } from '@wisemen/api-error'

export class ApiKeyInvalidPermissionsError extends BadRequestApiError {
  @ApiErrorCode('api_key_invalid_permissions')
  code = 'api_key_invalid_permissions'

  meta: never

  constructor () {
    super('Api key permissions are invalid for the selected scope')
  }
}
