import assert from 'assert'
import { ApiProperty } from '@nestjs/swagger'
import type { PaginatedKeysetResponse, PaginatedKeysetResponseMeta } from '@wisemen/pagination'
import { ViewExportIndexQueryKey } from './view-export-index.query.key.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import { ExportStatus, ExportStatusApiProperty } from '#src/app/export/entities/export-status.enum.js'
import { ExportType, ExportTypeApiProperty } from '#src/app/export/entities/export-type.enum.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { MimeTypeSuffix } from '#src/modules/files/enums/mime-type.enum.js'

export class ExportIndexItemResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: ExportUuid

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string

  @ExportStatusApiProperty()
  status: ExportStatus

  @ExportTypeApiProperty()
  type: ExportType

  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  fileUuid: FileUuid | null

  @ApiProperty({ type: String, nullable: true })
  fileName: string | null

  constructor (exp: Export) {
    assert(exp.file !== undefined, 'file not loaded')

    this.uuid = exp.uuid
    this.createdAt = exp.createdAt.toISOString()
    this.status = exp.status
    this.type = exp.type
    this.fileUuid = exp.fileUuid

    if (exp.file !== null) {
      this.fileName = exp.file.name + '.' + MimeTypeSuffix[exp.file.mimeType]
    } else {
      this.fileName = null
    }
  }
}

class ViewExportIndexResponseMeta implements PaginatedKeysetResponseMeta {
  @ApiProperty({ type: ViewExportIndexQueryKey, nullable: true })
  next: ViewExportIndexQueryKey | null

  constructor (entities: Export[]) {
    this.next = ViewExportIndexQueryKey.nextKey(entities)
  }
}

export class ViewExportIndexResponse implements PaginatedKeysetResponse {
  @ApiProperty({ type: ExportIndexItemResponse, isArray: true })
  items: ExportIndexItemResponse[]

  @ApiProperty({ type: ViewExportIndexResponseMeta })
  meta: ViewExportIndexResponseMeta

  constructor (entities: Export[]) {
    this.items = entities.map(entity => new ExportIndexItemResponse(entity))
    this.meta = new ViewExportIndexResponseMeta(entities)
  }
}
