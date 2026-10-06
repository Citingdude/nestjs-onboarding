import { ApiErrorCode } from '@wisemen/api-error'
import { NotFoundApiError } from '@wisemen/api-error'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class FileNotFoundError extends NotFoundApiError {
  @ApiErrorCode('file_not_found')
  code: 'file_not_found'

  meta: never

  constructor (fileUuid: FileUuid) {
    super(`File with uuid ${fileUuid} not found`)
    this.code = 'file_not_found'
  }
}
