import { ApiErrorCode } from '@wisemen/api-error'
import { NotFoundApiError } from '@wisemen/api-error'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

export class ContactNotFoundError extends NotFoundApiError {
  @ApiErrorCode('contact_not_found')
  code: 'contact_not_found'

  meta: never

  constructor (contactUuid: ContactUuid) {
    super(`Contact with uuid ${contactUuid} not found`)
    this.code = 'contact_not_found'
  }
}
