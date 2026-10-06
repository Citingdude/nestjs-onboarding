import { ApiErrorCode } from '@wisemen/api-error'
import { ServiceUnavailableApiError } from '@wisemen/api-error'

export class ImageResizerUnavailableError extends ServiceUnavailableApiError {
  @ApiErrorCode('image_resizer_unavailable')
  readonly code = 'image_resizer_unavailable'

  constructor (detail: string) {
    super(detail)
  }
}
