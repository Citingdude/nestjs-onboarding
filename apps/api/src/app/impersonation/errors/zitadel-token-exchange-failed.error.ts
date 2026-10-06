import { ApiErrorCode, ServiceUnavailableApiError } from '@wisemen/api-error'

export class ZitadelTokenExchangeFailedError extends ServiceUnavailableApiError {
  @ApiErrorCode('zitadel_token_exchange_failed')
  readonly code = 'zitadel_token_exchange_failed'

  constructor () {
    super('Zitadel token exchange failed')
  }
}
