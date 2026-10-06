import { ApiProperty } from '@nestjs/swagger'
import { ApiErrorCode } from '@wisemen/api-error'
import { ApiErrorMeta } from '@wisemen/api-error'
import { UnauthorizedApiError } from '@wisemen/api-error'

export class InvalidPublicFileTokenErrorMeta {
  @ApiProperty({
    required: true,
    description: 'The reason why the token is invalid',
    example: 'Token is not valid for public file downloads'
  })
  readonly reason: string

  constructor (reason: string) {
    this.reason = reason
  }
}

export class InvalidPublicFileTokenError extends UnauthorizedApiError {
  @ApiErrorCode('invalid_public_file_token')
  readonly code = 'invalid_public_file_token'

  @ApiErrorMeta()
  readonly meta: InvalidPublicFileTokenErrorMeta

  constructor (reason: string) {
    super(reason)
    this.meta = new InvalidPublicFileTokenErrorMeta(reason)
  }
}
