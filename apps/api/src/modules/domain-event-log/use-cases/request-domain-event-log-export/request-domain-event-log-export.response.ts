import { ApiProperty } from '@nestjs/swagger'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'

export class RequestDomainEventLogExportResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  exportUuid: ExportUuid

  constructor (exportUuid: ExportUuid) {
    this.exportUuid = exportUuid
  }
}
