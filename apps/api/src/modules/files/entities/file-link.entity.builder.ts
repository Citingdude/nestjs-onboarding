import { generateUuid } from '@wisemen/nestjs-common'
import { FileLink } from './file-link.entity.js'
import type { FileLinkUuid } from './file-link.uuid.js'
import type { FileUuid } from './file.uuid.js'

export class FileLinkBuilder {
  private fileLink: FileLink

  constructor () {
    this.fileLink = new FileLink()

    this.fileLink.uuid = generateUuid<FileLinkUuid>()
    this.fileLink.fileUuid = generateUuid<FileUuid>()
    this.fileLink.entityType = 'type'
    this.fileLink.entityUuid = generateUuid()
    this.fileLink.entityPart = 'part'
    this.fileLink.order = null
    this.fileLink.createdAt = new Date()
    this.fileLink.updatedAt = new Date()
  }

  withUuid (uuid: FileLinkUuid): this {
    this.fileLink.uuid = uuid
    return this
  }

  withFileUuid (fileUuid: FileUuid): this {
    this.fileLink.fileUuid = fileUuid
    return this
  }

  withEntityType (entityType: string): this {
    this.fileLink.entityType = entityType
    return this
  }

  withEntityUuid (entityUuid: string): this {
    this.fileLink.entityUuid = entityUuid
    return this
  }

  withEntityPart (entityPart: string): this {
    this.fileLink.entityPart = entityPart
    return this
  }

  withOrder (order: number | null): this {
    this.fileLink.order = order
    return this
  }

  build (): FileLink {
    return this.fileLink
  }
}
