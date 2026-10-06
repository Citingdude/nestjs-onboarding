import { generateUuid } from '@wisemen/nestjs-common'
import { Export } from './export.entity.js'
import type { ExportUuid } from './export.uuid.js'
import { ExportStatus } from './export-status.enum.js'
import { ExportType } from './export-type.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

export class ExportBuilder {
  private entity: Export

  constructor () {
    this.entity = new Export()
    this.entity.uuid = generateUuid()
    this.entity.status = ExportStatus.CREATED
    this.entity.type = ExportType.CONTACT_CSV
    this.entity.fileUuid = null
    this.entity.requestedByUserUuid = generateUuid()
    this.entity.errorMessage = null
    this.entity.createdAt = new Date()
    this.entity.updatedAt = new Date()
  }

  withUuid (uuid: ExportUuid): this {
    this.entity.uuid = uuid
    return this
  }

  withCreatedAt (date: Date): this {
    this.entity.createdAt = date
    return this
  }

  withUpdatedAt (date: Date): this {
    this.entity.updatedAt = date
    return this
  }

  withStatus (status: ExportStatus): this {
    this.entity.status = status
    return this
  }

  withType (type: ExportType): this {
    this.entity.type = type
    return this
  }

  withFileUuid (fileUuid: FileUuid | null): this {
    this.entity.fileUuid = fileUuid
    return this
  }

  withRequestedByUserUuid (requestedByUserUuid: UserUuid): this {
    this.entity.requestedByUserUuid = requestedByUserUuid
    return this
  }

  withErrorMessage (errorMessage: string | null): this {
    this.entity.errorMessage = errorMessage
    return this
  }

  build (): Export {
    return this.entity
  }
}
